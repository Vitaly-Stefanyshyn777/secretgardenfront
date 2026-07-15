"use client";
import PaginationNav from "@/components/ui/PaginationNav/PaginationNav";
import { normalizeImageUrl } from "@/lib/imageUtils";
import { useAuthStore } from "@/store/auth";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import styles from "./OrdersHistory.module.css";
import OrdersHistorySkeleton from "./OrdersHistorySkeleton";
import { BoxIcons } from "@/components/Icons/Icons";

interface NestOrderItem {
  product: {
    mainImageUrl: string;
    name: string;
    slug?: string;
  };
  quantity: number;
  price: number;
}

interface NestOrder {
  id: string | number;
  createdAt: string;
  total: number;
  deliveryMethod: string;
  status: string;
  items: NestOrderItem[];
}

type ViewOrder = {
  id: string;
  orderDate: string;
  orderNumber: string;
  status: string;
  deliveryMethodLabel: string;
  totalPrice: number;
  itemCount: number;
  productImages: string[];
  items: NestOrderItem[];
};

const OrdersHistory: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const ordersPerPage = 4;
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const { data: ordersData = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("bfb_token") ||
            localStorage.getItem("bfb_token_old")
          : null;

      const res = await fetch(`/api/orders`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        cache: "no-store",
      });
      if (!res.ok) return [] as NestOrder[];
      const data = await res.json();
      return (
        Array.isArray(data) ? data : (data?.orders ?? data?.items ?? [])
      ) as NestOrder[];
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const getStatusText = (status: string) => {
    switch (status) {
      case "NEW":
        return "Прийнято";
      case "IN_TRANSIT":
        return "В дорозі";
      case "DELIVERED":
        return "Доставлено";
      case "COMPLETED":
        return "Завершено";
      case "CANCELLED":
        return "Скасовано";
      default:
        return status || "Очікується";
    }
  };

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case "nova_poshta":
        return "Нова пошта";
      case "ukr_poshta":
        return "Укрпошта";
      case "pickup":
        return "Самовивіз";
      case "taxi":
        return "Таксі";
      default:
        return method || "Кур'єр";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const allOrders = useMemo(() => {
    return ordersData.map((o) => {
      const productImages = (o.items || []).map((item) =>
        normalizeImageUrl(item.product.mainImageUrl || "/placeholder.png"),
      );

      return {
        id: String(o.id),
        orderDate: formatDate(o.createdAt),
        orderNumber: `№${o.id}`,
        status: o.status,
        deliveryMethodLabel: getDeliveryMethodLabel(o.deliveryMethod),
        totalPrice: Number(o.total || 0),
        itemCount: (o.items || []).length,
        productImages,
        items: o.items || [],
      } as ViewOrder;
    });
  }, [ordersData]);

  const filteredOrders = useMemo(() => {
    if (activeFilter === "ALL") return allOrders;
    return allOrders.filter((o) => o.status === activeFilter);
  }, [allOrders, activeFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredOrders.length / ordersPerPage)),
    [filteredOrders.length],
  );

  const getStatusClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
      case "COMPLETED":
        return styles.delivered;
      case "NEW":
        return styles.accepted;
      case "IN_TRANSIT":
        return styles.inTransit;
      case "CANCELLED":
        return styles.cancelled;
      default:
        return "";
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("uk-UA")} грн`;
  };

  const handleViewProduct = (slug?: string) => {
    if (slug) {
      router.push(`/products/${slug}`);
    }
  };

  const filters = [
    { label: "Всі", value: "ALL" },
    { label: "Доставлено", value: "DELIVERED" },
    { label: "В дорозі", value: "IN_TRANSIT" },
    { label: "Прийнято", value: "NEW" },
  ];

  return (
    <div className={styles.ordersContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ваші замовлення</h1>
      </div>

      <div className={styles.tabs}>
        {filters.map((f) => (
          <button
            key={f.value}
            className={`${styles.tab} ${activeFilter === f.value ? styles.activeTab : ""}`}
            onClick={() => {
              setActiveFilter(f.value);
              setCurrentPage(1);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className={styles.divider}></div>

      {isLoading ? (
        <OrdersHistorySkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyContent}>
            <div className={styles.emptySubtitle}>У вас ще немає замовлень</div>
            <div className={styles.emptyDescription}>
              Тут з’явиться історія ваших покупок
            </div>
          </div>
          <BoxIcons />
        </div>
      ) : (
        <div className={styles.ordersList}>
          {filteredOrders
            .slice(
              (currentPage - 1) * ordersPerPage,
              currentPage * ordersPerPage,
            )
            .map((order) => (
              <React.Fragment key={order.id}>
                <div className={styles.orderCard}>
                  <div className={styles.orderCardHeader}>
                    <span
                      className={`${styles.orderStatusText} ${getStatusClass(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                    <span className={styles.orderDate}>{order.orderDate}</span>
                  </div>

                  <div className={styles.cardProducts}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={styles.productItem}
                        onClick={() => handleViewProduct(item.product.slug)}
                      >
                        <div className={styles.productImage}>
                          <Image
                            src={normalizeImageUrl(
                              item.product.mainImageUrl || "/placeholder.png",
                            )}
                            alt={item.product.name}
                            width={80}
                            height={80}
                          />
                        </div>
                        <div className={styles.productInfo}>
                          <div className={styles.productNameGroup}>
                            <h4 className={styles.productName}>
                              {item.product.name}
                            </h4>
                            <span className={styles.productQty}>
                              {item.quantity} шт.
                            </span>
                          </div>
                          <span className={styles.productPrice}>
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Інфо */}
                  <div className={styles.cardInfo}>
                    <div className={styles.infoContent}>
                      <div className={styles.infoRows}>
                        <div className={`${styles.infoRow} ${styles.infoRowDesktop}`}>
                          <span className={styles.infoLabel}>Дата</span>
                          <span className={styles.infoValue}>
                            {order.orderDate}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Сума</span>
                          <span className={styles.infoValue}>
                            {formatPrice(order.totalPrice)}
                          </span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>
                            Спосіб доставки
                          </span>
                          <span className={styles.infoValue}>
                            {order.deliveryMethodLabel}
                          </span>
                        </div>
                      </div>

                      <div className={`${styles.statusSection} ${styles.statusSectionDesktop}`}>
                        <span className={styles.statusLabel}>Статус:</span>
                        <div
                          className={`${styles.statusBadge} ${getStatusClass(order.status)}`}
                        >
                          {getStatusText(order.status)}
                        </div>
                      </div>
                    </div>

                    <div className={styles.cardActions}>
                      <button className={styles.repeatBtn}>
                        Повторити замовлення
                      </button>
                      <button className={styles.reviewBtn}>
                        Додати відгук
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
        </div>
      )}

      {totalPages > 1 && (
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </div>
  );
};

export default OrdersHistory;
