import { useState } from 'react'
import Card from '@/shared/ui/Card'
import Icon from '@/shared/ui/Icon'
import { useAuthStore } from '@/features/auth/model/authStore'

export default function AccountPage() {
  const { user, updateProfile } = useAuthStore()
  const [draft, setDraft] = useState<{ username?: string; profile_image?: string }>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const username = draft.username ?? user?.username ?? ''
  const profileImage = draft.profile_image ?? user?.profile_image ?? ''

  const handleSave = async () => {
    const trimmedName = username.trim()
    if (!trimmedName) {
      setError('이름을 입력하세요.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    const result = await updateProfile({
      username: trimmedName,
      profile_image: profileImage.trim() || null,
    })
    setSaving(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setDraft({})
    setMessage('저장되었습니다.')
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-bg border border-border overflow-hidden inline-flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <Icon name="user" size={20} className="text-text-secondary" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{user?.username || '사용자'}</p>
            <p className="text-sm text-text-secondary truncate">{user?.email || '-'}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">표시 이름</label>
            <input
              value={username}
              onChange={(event) => setDraft((prev) => ({ ...prev, username: event.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-1.5">프로필 이미지 URL</label>
            <input
              value={profileImage}
              onChange={(event) => setDraft((prev) => ({ ...prev, profile_image: event.target.value }))}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {message && <p className="text-sm text-success">{message}</p>}

        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex items-center gap-1 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors disabled:opacity-60"
        >
          <Icon name="check" size={14} />
          {saving ? '저장 중...' : '저장'}
        </button>
      </Card>
    </div>
  )
}
