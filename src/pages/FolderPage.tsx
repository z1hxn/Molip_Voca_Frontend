import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useVocaStore } from '@/features/voca/model/vocaStore'
import Card from '@/shared/ui/Card'
import EmptyState from '@/shared/ui/EmptyState'
import Modal from '@/shared/ui/Modal'
import Icon from '@/shared/ui/Icon'
import PageSkeleton from '@/shared/ui/PageSkeleton'
import type { VocaSet } from '@/shared/types'

export default function FolderPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { folders, fetchFolders, fetchVocaSets, createVocaSet } = useVocaStore()
  const [vocaSets, setVocaSets] = useState<VocaSet[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const folder = folders.find(f => f.id === id)

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const [, sets] = await Promise.all([fetchFolders(), fetchVocaSets(id)])
        setVocaSets(sets)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id, fetchFolders, fetchVocaSets])

  const handleCreate = async () => {
    if (!newTitle.trim() || !id) return
    const vocaId = await createVocaSet({ title: newTitle, folder_id: id })
    setNewTitle('')
    setShowModal(false)
    if (vocaId) navigate(`/voca/${vocaId}`)
  }

  if (loading) {
    return <PageSkeleton variant="folder" cards={4} />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold inline-flex items-center gap-2">
          <Icon name="folder" size={20} />
          {folder?.name || '폴더'}
        </h1>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
        >
          + 단어장 추가
        </button>
      </div>

      {vocaSets.length === 0 ? (
        <EmptyState
          icon={<Icon name="book" size={44} />}
          title="단어장이 없습니다"
          description="이 폴더에 단어장을 추가하세요"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vocaSets.map((voca, i) => (
            <motion.div
              key={voca.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hoverable onClick={() => navigate(`/voca/${voca.id}`)}>
                <h3 className="font-semibold">{voca.title}</h3>
                {voca.description && (
                  <p className="text-sm text-text-secondary mt-1 truncate">{voca.description}</p>
                )}
                <p className="text-xs text-text-secondary mt-2">
                  {new Date(voca.updated_at).toLocaleDateString('ko-KR')}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="새 단어장">
        <input
          type="text"
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          placeholder="단어장 제목"
          className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary mb-4"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-text-secondary hover:bg-bg">취소</button>
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark">만들기</button>
        </div>
      </Modal>
    </div>
  )
}
