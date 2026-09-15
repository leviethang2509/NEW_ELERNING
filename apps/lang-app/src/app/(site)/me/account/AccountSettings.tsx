'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_TIMEZONE,
  Gender,
  MIN_DATE_OF_BIRTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  isValidDateOfBirth,
  todayInTimeZone,
  type AuthResponse,
  type AuthUser,
} from '@lang/shared';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  FormAlert,
  PasswordInput,
  inputClass,
  labelClass,
  labelTextClass,
  primaryButtonClass,
} from '@/components/ui';
import { vi } from '@/i18n/vi';
import { api } from '@/lib/api';
import { destinationAfterLogin } from '@/lib/auth-redirect';

type Feedback = { tone: 'error' | 'success'; message: string } | null;

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6">
      <h2 className="text-[17px] font-semibold text-[var(--heading)]">
        {title}
      </h2>
      {description && (
        <p className="mt-1 text-[13.5px] text-[var(--body)]">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({
    fullName: user.fullName,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender ?? '',
    phone: user.phone ?? '',
    address: user.address ?? '',
  });
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);
  const today = todayInTimeZone(DEFAULT_TIMEZONE);

  const update =
    (field: keyof typeof form) =>
    (
      event: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((current) => ({ ...current, [field]: event.target.value }));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValidDateOfBirth(form.dateOfBirth, today)) {
      setFeedback({ tone: 'error', message: vi.auth.invalidDateOfBirth });
      return;
    }
    setFeedback(null);
    setSaving(true);
    try {
      const updated = await api.patch<AuthUser>('/me/profile', {
        ...form,
        gender: form.gender || null,
      });
      setUser(updated);
      setFeedback({ tone: 'success', message: vi.account.profileSaved });
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: errorMessage(error, vi.account.saveFailed),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className={`${labelClass} sm:col-span-2`}>
        <span className={labelTextClass}>{vi.auth.email}</span>
        <input value={user.email} disabled className={inputClass} />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>{vi.auth.fullName}</span>
        <input
          required
          maxLength={150}
          value={form.fullName}
          onChange={update('fullName')}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>{vi.auth.dateOfBirth}</span>
        <input
          type="date"
          required
          min={MIN_DATE_OF_BIRTH}
          max={today}
          value={form.dateOfBirth}
          onChange={update('dateOfBirth')}
          className={inputClass}
        />
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>{vi.account.gender}</span>
        <select
          value={form.gender}
          onChange={update('gender')}
          className={inputClass}
        >
          <option value="">{vi.account.genderUnset}</option>
          {Object.values(Gender).map((gender) => (
            <option key={gender} value={gender}>
              {vi.gender[gender]}
            </option>
          ))}
        </select>
      </label>

      <label className={labelClass}>
        <span className={labelTextClass}>{vi.account.phone}</span>
        <input
          type="tel"
          maxLength={30}
          autoComplete="tel"
          value={form.phone}
          onChange={update('phone')}
          className={inputClass}
        />
      </label>

      <label className={`${labelClass} sm:col-span-2`}>
        <span className={labelTextClass}>{vi.account.address}</span>
        <input
          maxLength={500}
          autoComplete="street-address"
          value={form.address}
          onChange={update('address')}
          className={inputClass}
        />
      </label>

      {feedback && (
        <div className="sm:col-span-2">
          <FormAlert tone={feedback.tone}>{feedback.message}</FormAlert>
        </div>
      )}

      <div className="sm:col-span-2">
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? vi.common.processing : vi.account.save}
        </button>
      </div>
    </form>
  );
}

function ChangePasswordForm({ forced }: { forced: boolean }) {
  const router = useRouter();
  const { applySession } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ tone: 'error', message: vi.account.passwordMismatch });
      return;
    }
    setFeedback(null);
    setSaving(true);
    try {
      const session = await api.post<AuthResponse>('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      applySession(session);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ tone: 'success', message: vi.account.passwordChanged });
      // Đổi xong mật khẩu bắt buộc thì vào trang đích như vừa đăng nhập.
      if (forced) router.replace(destinationAfterLogin(session.user));
    } catch (error) {
      setFeedback({
        tone: 'error',
        message: errorMessage(error, vi.account.saveFailed),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-md gap-4">
      <label className={labelClass}>
        <span className={labelTextClass}>{vi.account.currentPassword}</span>
        <PasswordInput
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>{vi.account.newPassword}</span>
        <PasswordInput
          required
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          placeholder={vi.auth.passwordPlaceholder}
        />
      </label>
      <label className={labelClass}>
        <span className={labelTextClass}>{vi.account.confirmPassword}</span>
        <PasswordInput
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </label>

      {feedback && (
        <FormAlert tone={feedback.tone}>{feedback.message}</FormAlert>
      )}

      <div>
        <button type="submit" disabled={saving} className={primaryButtonClass}>
          {saving ? vi.common.processing : vi.account.changePassword}
        </button>
      </div>
    </form>
  );
}

export function AccountSettings() {
  const { user } = useAuth();
  if (!user) return null;
  const forced = user.mustChangePassword;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 py-10">
      <h1 className="text-[28px] font-bold text-[var(--heading)]">
        {vi.account.title}
      </h1>

      {forced && <FormAlert tone="error">{vi.account.mustChange}</FormAlert>}

      {/* Còn cờ bắt đổi mật khẩu thì API chặn sửa hồ sơ, nên ẩn form hồ sơ. */}
      {!forced && (
        <Card title={vi.account.profile}>
          <ProfileForm user={user} />
        </Card>
      )}

      <Card
        title={vi.account.changePassword}
        description={vi.account.changePasswordHint}
      >
        <ChangePasswordForm forced={forced} />
      </Card>
    </div>
  );
}
