"use client";

import Image from "next/image";
import Link from "next/link";
import { InstagramIcon, TelegramIcon } from "@/components/Icons/Icons";
import s from "./AboutSection.module.css";

const AboutSection = () => {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <div className={s.block}>
          <div className={`${s.mediaBlock} ${s.mediaBlockWithButton}`}>
            <Image
              src="/images/Rectangle-12-2.jpg"
              alt="Наша політика"
              width={541}
              height={318}
              className={s.image}
            />
            <button className={s.actionButton}>Переглянути сертифікати</button>
          </div>
          <div className={s.contentBlock}>
            <h2 className={s.title}>Наша політика</h2>
            <div className={s.textGroup}>
              <p className={s.text}>
                Secret Garden — це простір, створений на принципах натуральності,
                прозорості та відповідального підходу. Ми працюємо виключно з
                продуктами, що мають зрозуміле походження та відповідають чинним
                вимогам законодавства.
              </p>
              <p className={s.text}>
                У нашому магазині не представлені продукти, що містять THC, а
                також сполуки, отримані синтетичним шляхом. Ми свідомо обираємо
                натуральні формати та інгредієнти без сумнівних домішок.
              </p>
              <p className={s.text}>
                Ми розвиваємось як окремий, самостійний проєкт із власною
                філософією та підходом. Ми робимо акцент на легальних,
                перевірених продуктах і дотримуємося чіткої позиції щодо безпеки
                та відповідального використання.
              </p>
            </div>
          </div>
        </div>

        <div className={s.block}>
          <div className={s.contentBlock}>
            <h2 className={s.title}>Ціль</h2>
            <div className={s.textGroup}>
              <p className={s.text}>
                Наша мета — підтримати людей, які шукають м’яке заспокоєння,
                зниження напруги та фізичний комфорт, а також тих, хто надає
                перевагу натуральним способам розслаблення.
              </p>
              <p className={s.text}>
                Ми не обіцяємо миттєвих ефектів і не формуємо завищених
                очікувань. Натомість ми пропонуємо продукти та середовище, які
                можуть стати частиною особистих ритуалів відновлення, відпочинку
                й турботи про себе.
              </p>
            </div>
          </div>
          <div className={s.mediaBlock}>
            <Image
              src="/images/Rectangle-14.jpg"
              alt="Ціль"
              width={541}
              height={318}
              className={s.image}
            />
          </div>
        </div>

        <div className={s.block}>
          <div className={s.mediaBlock}>
            <Image
              src="/images/Rectangle-15.jpg"
              alt="Інші послуги"
              width={541}
              height={318}
              className={s.image}
            />
          </div>
          <div className={s.contentBlock}>
            <h2 className={s.title}>Інші послуги</h2>
            <div className={s.textGroup}>
              <p className={s.text}>
                Secret Garden — це не лише магазин, а й живий простір. У нашому
                закладі ви можете:
              </p>
              <p className={s.text}>
                Випити каву в спокійній атмосфері
                <br />
                Скористатися можливістю покурити легально
                <br />
                Відвідати чайні церемонії, які проходять за попереднім записом.
              </p>
              <p className={s.text}>
                Записатися на церемонію ви можете нижче:
              </p>
            </div>
            <div className={s.socialButtons}>
              <Link
                href="https://www.instagram.com/secret_garden_dnipro"
                target="_blank"
                rel="noopener noreferrer"
                className={s.socialButton}
              >
                <InstagramIcon />
                <span>Instagram</span>
              </Link>
              <Link
                href="https://t.me/Secret_Garden_shop420"
                target="_blank"
                rel="noopener noreferrer"
                className={s.socialButton}
              >
                <TelegramIcon />
                <span>Telegram</span>
              </Link>
            </div>
          </div>
        </div>

        <div className={s.block}>
          <div className={s.contentBlock}>
            <h2 className={s.title}>Підтримка та вдячність</h2>
            <div className={s.textGroup}>
              <p className={s.text}>
                Ми працюємо в Україні й усвідомлюємо відповідальність перед нашою
                спільнотою. Для військовослужбовців діє знижка 10% — її можна
                отримати у фізичному закладі у вигляді промокоду.
              </p>
              <p className={s.text}>
                Окрім цього, ми регулярно долучаємось до зборів на дрони для
                наших захисників. Це наш спосіб виразити нашу вдячність за
                можливість прокидатися кожного дня.
              </p>
            </div>
            <button className={s.supportButton}>
              <span>+</span>
              <span>Підтримати збір</span>
              <span>+</span>
            </button>
          </div>
          <div className={s.mediaBlock}>
            <Image
              src="/images/Rectangle-13.jpg"
              alt="Підтримка та вдячність"
              width={541}
              height={318}
              className={s.image}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
