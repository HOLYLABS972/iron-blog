'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { RichTextEditor } from '@/components/UI/RichTextEditor'

interface Training {
  id: string
  title: string
  slug: string
  subheader: string
  content: string
  coverImageUrl: string
  level: string
  durationMinutes: number | null
  authorName: string
  likes?: number
  views?: number
  commentCount?: number
  created_at: string
  updated_at: string
}

export default function AdminTrainings() {
  const { currentUser } = useAuth()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [subheader, setSubheader] = useState('')
  const [content, setContent] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [level, setLevel] = useState('beginner')
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('')
  const [authorName, setAuthorName] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    fetchTrainings()
  }, [])

  useEffect(() => {
    if (currentUser) {
      setAuthorName(currentUser.displayName || currentUser.email || 'Unknown')
    }
  }, [currentUser])

  const fetchTrainings = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch('/api/admin/trainings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setTrainings(data.trainings || [])
      }
    } catch (error) {
      console.error('Error fetching trainings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      const token = localStorage.getItem('accessToken')
      const url = editingTraining ? `/api/admin/trainings/${editingTraining.id}` : '/api/admin/trainings'
      const method = editingTraining ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          slug,
          subheader,
          content,
          coverImageUrl,
          level,
          durationMinutes: durationMinutes === '' ? null : durationMinutes,
          authorName
        })
      })

      if (response.ok) {
        resetForm()
        fetchTrainings()
        setShowCreateForm(false)
        setEditingTraining(null)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save training')
      }
    } catch (error) {
      console.error('Error saving training:', error)
      alert('Error saving training')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (training: Training) => {
    setEditingTraining(training)
    setTitle(training.title)
    setSlug(training.slug)
    setSubheader(training.subheader)
    setContent(training.content)
    setCoverImageUrl(training.coverImageUrl)
    setLevel(training.level)
    setDurationMinutes(training.durationMinutes || '')
    setAuthorName(training.authorName)
    setShowCreateForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this training?')) return

    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`/api/admin/trainings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchTrainings()
      } else {
        alert('Failed to delete training')
      }
    } catch (error) {
      console.error('Error deleting training:', error)
      alert('Error deleting training')
    }
  }

  const resetForm = () => {
    setTitle('')
    setSlug('')
    setSubheader('')
    setContent('')
    setCoverImageUrl('')
    setLevel('beginner')
    setDurationMinutes('')
    setAuthorName(currentUser?.displayName || currentUser?.email || 'Unknown')
    setEditingTraining(null)
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Upload failed')
    
    const data = await response.json()
    return data.url || data.file_url
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading trainings...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Trainings</h1>
        <div className="flex gap-4">
          <Link href="/admin" className="px-4 py-2 text-gray-600 hover:text-gray-900">
            ← Back to Admin
          </Link>
          <button
            onClick={() => {
              resetForm()
              setShowCreateForm(!showCreateForm)
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : '+ New Training'}
          </button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingTraining ? 'Edit Training' : 'Create New Training'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL) *
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="training-url-slug"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subheader
              </label>
              <input
                type="text"
                value={subheader}
                onChange={(e) => setSubheader(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level *
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name *
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg or /uploads/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Content *
              </label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your training content here..."
                rows={15}
                onImageUpload={handleImageUpload}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : (editingTraining ? 'Update Training' : 'Create Training')}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setShowCreateForm(false)
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Trainings List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stats
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No trainings found. Create your first training!
                  </td>
                </tr>
              ) : (
                trainings.map((training) => (
                  <tr key={training.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{training.title}</div>
                      <div className="text-sm text-gray-500">{training.subheader}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${training.level === 'beginner' ? 'bg-green-100 text-green-800' : ''}
                        ${training.level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${training.level === 'advanced' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {training.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {training.durationMinutes ? `${training.durationMinutes} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {training.authorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>👁️ {training.views || 0}</div>
                      <div>❤️ {training.likes || 0}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(training)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(training.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

