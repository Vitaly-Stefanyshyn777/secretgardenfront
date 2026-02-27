import {
  UseFormRegister,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormGetValues,
} from "react-hook-form";
import {
  EmailIcon,
  NumberIcon,
  UserIcon,
  PasswordsIcon,
} from "@/components/Icons/Icons";
import InputField from "@/components/ui/FormFields/InputField";
import PasswordField from "@/components/ui/FormFields/PasswordField";
import s from "./RegisterModal.module.css";

export interface RegisterFormValues {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  confirm_password: string;
}

interface RegisterFormProps {
  register: UseFormRegister<RegisterFormValues>;
  errors: FieldErrors<RegisterFormValues>;
  handleSubmit: UseFormHandleSubmit<RegisterFormValues>;
  onSubmit: (data: RegisterFormValues) => Promise<void>;
  isSubmitting: boolean;
  isPending: boolean;
  isError: boolean;
  getValues: UseFormGetValues<RegisterFormValues>;
}

export default function RegisterForm({
  register,
  errors,
  handleSubmit,
  onSubmit,
  isSubmitting,
  isPending,
  isError,
  getValues,
}: RegisterFormProps) {
  return (
    <form className={s.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={s.row}>
        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label="Ваше ім'я"
            type="text"
            id="register-form-first-name-field"
            hasError={!!errors.first_name}
            supportingText="Будь ласка, вкажіть імʼя"
            {...register("first_name", { required: true })}
          />
        </div>

        <div className={s.inputGroup}>
          <InputField
            icon={<UserIcon />}
            label="Ваше прізвище"
            type="text"
            id="register-form-last-name-field"
            hasError={!!errors.last_name}
            supportingText="Будь ласка, вкажіть прізвище"
            {...register("last_name", { required: true })}
          />
        </div>
      </div>

      <div className={s.row}>
        <div className={s.rowSingle}>
          <InputField
            icon={<EmailIcon />}
            label="Ваша пошта"
            type="email"
            id="register-form-email-field"
            hasError={!!errors.email}
            supportingText={
              (errors.email?.message as string) ||
              'Електронна адреса має містити знак "@" та коректний домен'
            }
            {...register("email", {
              required: "Вкажіть email",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message:
                  'Електронна адреса має містити знак "@" та коректний домен',
              },
            })}
          />
        </div>

        <div className={s.rowSingle}>
          <InputField
            icon={<NumberIcon />}
            label="Ваш номер телефону"
            type="tel"
            id="register-form-phone-field"
            onlyDigits
            hasError={!!errors.phone}
            supportingText="Будь ласка, вкажіть номер телефону"
            {...register("phone", { required: true })}
          />
        </div>
      </div>
      <div className={s.row}>
        <div className={s.rowSingle}>
          <PasswordField
            icon={<PasswordsIcon />}
            label="Пароль"
            hasError={!!errors.password}
            supportingText={
              (errors.password?.message as string) ||
              "Пароль має містити щонайменше 6 символів"
            }
            {...register("password", {
              required: true,
              minLength: {
                value: 6,
                message: "Пароль має містити щонайменше 6 символів",
              },
            })}
          />
        </div>

        <div className={s.rowSingle}>
          <PasswordField
            icon={<PasswordsIcon />}
            label="Повторіть пароль"
            hasError={!!errors.confirm_password}
            supportingText={
              (errors.confirm_password?.message as string) ||
              "Паролі мають співпадати"
            }
            {...register("confirm_password", {
              required: "Підтвердіть пароль",
              validate: (value) =>
                value === getValues("password") || "Паролі мають співпадати",
            })}
          />
        </div>
      </div>

      {isError && (
        <p className={s.error}>Помилка реєстрації. Спробуйте ще раз.</p>
      )}

      <div className={s.privacyLinkBlock}>
        <div className={s.submitBlock}>
          <button
            className={s.submit}
            type="submit"
            disabled={isSubmitting || isPending}
          >
            {isPending ? "Відправка..." : "Вже маю акаунт"}
          </button>
          <button
            className={s.submitTwo}
            type="submit"
            disabled={isSubmitting || isPending}
          >
            {isPending ? "Відправка..." : "Продовжити"}
          </button>
        </div>

        <p className={s.privacyText}>
          Натискаючи на кнопку, ви погоджуєтесь з{" "}
          <a href="/privacy-policy" className={s.privacyLink}>
            Політикою конфіденційності
          </a>
        </p>
      </div>
    </form>
  );
}
