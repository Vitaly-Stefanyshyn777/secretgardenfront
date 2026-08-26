"use client";

import React, { useState, useMemo } from "react";
import { FormData } from "./types";
import s from "./CheckoutSection.module.css";
import DropdownField, {
  DropdownOption,
} from "@/components/ui/FormFields/DropdownField";
import BranchDropdownField, {
  BranchDropdownOption,
} from "@/components/ui/FormFields/BranchDropdownField";
import InputField from "@/components/ui/FormFields/InputField";
import { useTranslation } from "@/hooks/useTranslation";
import { useCourierDeliveryAvailable } from "@/components/hooks/useCourierDeliveryAvailable";
import { COURIER_HOURS_LABEL } from "@/lib/courierDeliveryHours";

const DNIPRO_CITY = "Дніпро";

interface Warehouse {
  name: string;
  position?: {
    latitude: number;
    longitude: number;
  };
  maxWeightPlaceSender?: number;
  maxWeightPlaceRecipient?: number;
  workSchedule?: string;
}

interface DeliveryFormProps {
  deliveryType: string;
  formData: FormData;
  setDeliveryType: (value: string) => void;
  setFormData: (data: FormData) => void;
  setIsMapOpen: (value: boolean) => void;
  errors?: {
    deliveryType?: string;
    city?: string;
    branch?: string;
    house?: string;
    building?: string;
    apartment?: string;
  };
}

export default function DeliveryForm({
  deliveryType,
  formData,
  setDeliveryType,
  setFormData,
  setIsMapOpen,
  errors = {},
}: DeliveryFormProps) {
  const { t } = useTranslation();
  const courierAvailable = useCourierDeliveryAvailable();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const isCourier = deliveryType === "courier";

  const deliveryOptions: BranchDropdownOption[] = useMemo(
    () => [
      { value: "branch", label: t("checkout.toBranch") },
      { value: "postomat", label: t("checkout.postomat") },
      {
        value: "courier",
        label: t("checkout.courier"),
        disabled: !courierAvailable,
      },
    ],
    [t, courierAvailable],
  );

  React.useEffect(() => {
    if (deliveryType === "courier" && !courierAvailable) {
      setDeliveryType("");
    }
  }, [courierAvailable, deliveryType, setDeliveryType]);

  React.useEffect(() => {
    if (isCourier && formData.city !== DNIPRO_CITY) {
      setFormData({ ...formData, city: DNIPRO_CITY });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync city only when courier selected
  }, [isCourier]);

  const [cities, setCities] = React.useState<DropdownOption[]>([]);
  const [loadingCities, setLoadingCities] = React.useState(false);

  React.useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch("/updated_data.json");
        const data = await response.json();

        const uniqueCities = (data as Array<{ name?: string }>)
          .map((city) => city.name || "")
          .filter(
            (name: string, index: number, arr: string[]) =>
              arr.indexOf(name) === index,
          )
          .sort()
          .slice(0, 100)
          .map((name: string) => ({ value: name, label: name }));

        setCities(uniqueCities);
      } catch {
        setCities([
          { value: "Київ", label: "Київ" },
          { value: "Чернігів", label: "Чернігів" },
          { value: "Львів", label: "Львів" },
          { value: DNIPRO_CITY, label: DNIPRO_CITY },
        ]);
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, []);

  const [branches, setBranches] = React.useState<DropdownOption[]>([]);
  const [loadingBranches, setLoadingBranches] = React.useState(false);

  React.useEffect(() => {
    if (!formData.city || isCourier) {
      setBranches([]);
      return;
    }

    const loadBranches = async () => {
      setLoadingBranches(true);
      try {
        const response = await fetch("/updated_data.json");
        const data = await response.json();

        const selectedCity = (
          data as Array<{
            name?: string;
            branches?: Array<{ name: string }>;
            warehouses?: Array<{ name: string }>;
          }>
        ).find((city) => city.name === formData.city);
        if (!selectedCity) {
          setBranches([]);
          return;
        }

        let allWarehouses: Warehouse[] = [];

        if (deliveryType === "branch") {
          allWarehouses = [
            ...(selectedCity.branches || []),
            ...(selectedCity.warehouses || []).filter(
              (warehouse) => !warehouse.name.includes("Поштомат"),
            ),
          ];
        } else if (deliveryType === "postomat") {
          allWarehouses = [
            ...(selectedCity.warehouses || []).filter((warehouse) =>
              warehouse.name.includes("Поштомат"),
            ),
          ];
        } else {
          allWarehouses = [
            ...(selectedCity.branches || []),
            ...(selectedCity.warehouses || []),
          ];
        }

        const branchesList: DropdownOption[] = allWarehouses
          .map((warehouse: { name: string }) => {
            const formattedName = warehouse.name
              .replace(/Пункт приймання-видачі \(до \d+ кг\): /, "")
              .replace(/Поштомат "Нова Пошта" №\d+: /, "Поштомат: ");
            return {
              value: formattedName,
              label: formattedName,
            };
          })
          .slice(0, 50);

        setBranches(branchesList);
      } catch {
        setBranches([]);
      } finally {
        setLoadingBranches(false);
      }
    };

    loadBranches();
  }, [formData.city, deliveryType, isCourier]);

  const branchPlaceholder = loadingBranches
    ? t("checkout.loading")
    : !formData.city
      ? t("checkout.chooseCityFirst")
      : branches.length === 0
        ? t("checkout.noBranches")
        : deliveryType === "postomat"
          ? t("checkout.choosePostomat")
          : t("checkout.toBranch");

  return (
    <div className={s.deliveryBlock}>
      <h2 className={s.sectionTitle}>{t("checkout.delivery")}</h2>
      <div className={s.deliveryGrid}>
        {!courierAvailable && (
          <p className={s.courierHoursHint}>
            {t("checkout.courierHoursHint", { hours: COURIER_HOURS_LABEL })}
          </p>
        )}
        <div className={s.deliveryRow}>
          <div className={s.inputWrap}>
            <BranchDropdownField
              label=""
              value={deliveryType}
              options={deliveryOptions}
              placeholder={t("checkout.chooseDelivery")}
              onChange={(value) => {
                setDeliveryType(value);
                setFormData({
                  ...formData,
                  branch: "",
                  city: value === "courier" ? DNIPRO_CITY : formData.city,
                });
              }}
              showLabel={false}
              hasError={!!errors.deliveryType}
              supportingText={errors.deliveryType || ""}
              isOpen={openDropdown === "delivery"}
              onOpenChange={(isOpen) =>
                setOpenDropdown(isOpen ? "delivery" : null)
              }
              backgroundColor="white"
            />
          </div>
          {!isCourier && (
            <div className={s.inputWrap}>
              <DropdownField
                label=""
                value={formData.city}
                options={cities}
                placeholder={
                  loadingCities
                    ? t("checkout.loadingCities")
                    : t("checkout.city")
                }
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    city: value,
                    branch: "",
                  })
                }
                showLabel={false}
                hasError={!!errors.city}
                supportingText={errors.city || ""}
                isOpen={openDropdown === "city"}
                onOpenChange={(isOpen) =>
                  setOpenDropdown(isOpen ? "city" : null)
                }
                backgroundColor="white"
              />
            </div>
          )}
        </div>

        <div className={s.deliveryRow}>
          <div className={s.inputWrapBranch}>
            {isCourier ? (
              <InputField
                label={t("checkout.deliveryAddress")}
                type="text"
                value={formData.branch}
                onChange={(e) =>
                  setFormData({ ...formData, branch: e.target.value })
                }
                hasError={!!errors.branch}
                supportingText={errors.branch || ""}
                placeholder={t("checkout.fullAddressPlaceholder")}
              />
            ) : (
              <DropdownField
                label=""
                value={formData.branch}
                options={branches}
                key={branches.length}
                placeholder={branchPlaceholder}
                onChange={(value) =>
                  setFormData({ ...formData, branch: value })
                }
                showLabel={false}
                hasError={!!errors.branch}
                supportingText={errors.branch || ""}
                isOpen={openDropdown === "branch"}
                onOpenChange={(isOpen) =>
                  setOpenDropdown(isOpen ? "branch" : null)
                }
                backgroundColor="white"
                disabled={!formData.city || branches.length === 0}
              />
            )}
          </div>
          {isCourier && (
            <div className={s.addressFields}>
              <div className={`${s.inputWrap} ${s.inputWrapHouse}`}>
                <InputField
                  label={t("checkout.building")}
                  type="text"
                  value={formData.house}
                  onChange={(e) =>
                    setFormData({ ...formData, house: e.target.value })
                  }
                  hasError={!!errors.house}
                  supportingText={errors.house || ""}
                />
              </div>
              <div className={`${s.inputWrap} ${s.inputWrapBuilding}`}>
                <InputField
                  label={t("checkout.buildingBlock")}
                  type="text"
                  value={formData.building}
                  onChange={(e) =>
                    setFormData({ ...formData, building: e.target.value })
                  }
                  hasError={!!errors.building}
                  supportingText={errors.building || ""}
                />
              </div>
              <div className={`${s.inputWrap} ${s.inputWrapApartment}`}>
                <InputField
                  label={t("checkout.apartment")}
                  type="text"
                  value={formData.apartment}
                  onChange={(e) =>
                    setFormData({ ...formData, apartment: e.target.value })
                  }
                  hasError={!!errors.apartment}
                  supportingText={errors.apartment || ""}
                />
              </div>
            </div>
          )}
          {!isCourier && (
            <button
              className={s.primary}
              onClick={() => setIsMapOpen(true)}
              disabled={!formData.city}
            >
              {t("checkout.chooseOnMap")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
