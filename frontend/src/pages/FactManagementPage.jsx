import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFact, getFacts, updateFactById, updateFactStatusById } from '../services/factService'
import { getCategories } from '../services/categoryService'
import { getTags } from '../services/tagService'
import { uploadImage } from '../services/mediaService'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'
import { useAuth } from '../hooks/authContext'
import { isAdmin } from '../utils/roleAccess'

const EMPTY_FORM = {
  id: '',
  title: '',
  short_fact: '',
  category_id: '',
  tag_ids: [],
  content: {
    intro: '',
    body: '',
    conclusion: '',
    images: []
  }
}

export default function FactManagementPage() {
  const { t, language } = useI18n()
  const { user } = useAuth()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()
  const userIsAdmin = isAdmin(user)

  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    search: '',
    page: 1,
    limit: 10
  })
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageUpload, setImageUpload] = useState({ file: null, alt: '', caption: '' })
  const [statusDraftById, setStatusDraftById] = useState({})

  const previewUrl = useMemo(() => {
    if (!imageUpload.file) {
      return ''
    }
    return URL.createObjectURL(imageUpload.file)
  }, [imageUpload.file])

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    },
    [previewUrl]
  )

  const categoriesQuery = useQuery({
    queryKey: ['fact-management-categories', language],
    queryFn: () =>
      getCategories(
        { language },
        {
          errorFallbackMessage: t('admin.facts.load_filters_failed')
        }
      )
  })

  const tagsQuery = useQuery({
    queryKey: ['fact-management-tags'],
    queryFn: () =>
      getTags({
        errorFallbackMessage: t('admin.facts.load_filters_failed')
      })
  })

  const factsQuery = useQuery({
    queryKey: ['fact-management', filters, userIsAdmin],
    queryFn: () =>
      getFacts(
        {
          status: filters.status || undefined,
          category_id: filters.category_id || undefined,
          search: filters.search || undefined,
          page: filters.page,
          limit: filters.limit
        },
        { errorFallbackMessage: t('admin.facts.load_list_failed') }
      )
  })

  const saveFactMutation = useMutation({
    mutationFn: (payload) => {
      const requestOptions = { errorFallbackMessage: t('admin.facts.save_failed') }
      if (payload.id) {
        return updateFactById(payload.id, payload.body, requestOptions)
      }

      return createFact(payload.body, requestOptions)
    },
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.facts.save_success') })
      setForm(EMPTY_FORM)
      queryClient.invalidateQueries({ queryKey: ['fact-management'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.facts.save_failed') })
    }
  })

  const uploadMutation = useMutation({
    mutationFn: (file) =>
      uploadImage(file, {
        errorFallbackMessage: t('admin.media.upload_failed')
      }),
    onSuccess: (uploaded) => {
      setForm((prev) => ({
        ...prev,
        content: {
          ...prev.content,
          images: [
            ...prev.content.images,
            {
              url: uploaded?.url || '',
              alt: imageUpload.alt.trim() || null,
              caption: imageUpload.caption.trim() || null
            }
          ]
        }
      }))
      pushToast({ type: 'success', message: t('admin.media.upload_success') })
      setImageUpload({ file: null, alt: '', caption: '' })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.media.upload_failed') })
    }
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      updateFactStatusById(id, payload, {
        errorFallbackMessage: t('admin.facts.update_status_failed')
      }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.facts.update_status_success') })
      queryClient.invalidateQueries({ queryKey: ['fact-management'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.facts.update_status_failed') })
    }
  })

  const categories = categoriesQuery.data ?? []
  const tags = tagsQuery.data ?? []
  const facts = factsQuery.data?.items ?? []
  const pagination = factsQuery.data?.pagination
  const page = pagination?.page ?? filters.page
  const totalPages = Math.max(1, pagination?.total_pages ?? 1)

  const factStatusOptions = useMemo(
    () => [
      { value: '', label: t('admin.facts.all_statuses') },
      { value: 'draft', label: t('admin.facts.status.draft') },
      { value: 'published', label: t('admin.facts.status.published') }
    ],
    [t]
  )

  const toggleTag = (tagId) => {
    setForm((prev) => {
      const exists = prev.tag_ids.includes(tagId)
      return {
        ...prev,
        tag_ids: exists ? prev.tag_ids.filter((id) => id !== tagId) : [...prev.tag_ids, tagId]
      }
    })
  }

  const resetForm = () => {
    setForm(EMPTY_FORM)
    setImageUpload({ file: null, alt: '', caption: '' })
  }

  const startEdit = (fact) => {
    setForm({
      id: fact.id,
      title: fact.title || '',
      short_fact: fact.short_fact || '',
      category_id: String(fact.category_id || ''),
      tag_ids: Array.isArray(fact.tag_ids) ? fact.tag_ids.map((id) => String(id)) : [],
      content: {
        intro: fact.content?.intro || '',
        body: fact.content?.body || '',
        conclusion: fact.content?.conclusion || '',
        images: Array.isArray(fact.content?.images) ? fact.content.images : []
      }
    })
  }

  const submitFact = (event) => {
    event.preventDefault()

    const payload = {
      title: form.title.trim(),
      short_fact: form.short_fact.trim(),
      content: {
        intro: form.content.intro.trim(),
        body: form.content.body.trim(),
        conclusion: form.content.conclusion.trim(),
        images: form.content.images
      },
      category_id: form.category_id,
      tag_ids: form.tag_ids
    }

    saveFactMutation.mutate({
      id: form.id,
      body: payload
    })
  }

  const handleUploadImage = () => {
    if (!imageUpload.file) {
      pushToast({ type: 'error', message: t('admin.media.file_required') })
      return
    }

    const isImage = imageUpload.file.type.startsWith('image/')
    if (!isImage) {
      pushToast({ type: 'error', message: t('admin.media.file_invalid_type') })
      return
    }

    const maxBytes = 5 * 1024 * 1024
    if (imageUpload.file.size > maxBytes) {
      pushToast({ type: 'error', message: t('admin.media.file_too_large') })
      return
    }

    uploadMutation.mutate(imageUpload.file)
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.facts.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.facts.subtitle')}</p>
      </header>

      <form onSubmit={submitFact} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">
            {form.id ? t('admin.facts.edit_fact') : t('admin.facts.create_fact')}
          </h3>
          {form.id ? (
            <button type="button" onClick={resetForm} className="text-sm text-slate-600 underline">
              {t('admin.facts.cancel_edit')}
            </button>
          ) : null}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">
            {t('admin.facts.field_title')}
            <input
              required
              minLength={5}
              maxLength={150}
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="text-sm text-slate-700">
            {t('admin.facts.field_category')}
            <select
              required
              value={form.category_id}
              onChange={(event) => setForm((prev) => ({ ...prev, category_id: event.target.value }))}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            >
              <option value="">{t('admin.facts.select_category')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm text-slate-700">
          {t('admin.facts.field_short_fact')}
          <textarea
            required
            minLength={10}
            maxLength={280}
            rows={2}
            value={form.short_fact}
            onChange={(event) => setForm((prev) => ({ ...prev, short_fact: event.target.value }))}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          {t('admin.facts.field_intro')}
          <textarea
            required
            minLength={20}
            maxLength={400}
            rows={3}
            value={form.content.intro}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                content: { ...prev.content, intro: event.target.value }
              }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          {t('admin.facts.field_body')}
          <textarea
            required
            minLength={80}
            maxLength={8000}
            rows={6}
            value={form.content.body}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                content: { ...prev.content, body: event.target.value }
              }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-slate-700">
          {t('admin.facts.field_conclusion')}
          <textarea
            required
            minLength={20}
            maxLength={600}
            rows={3}
            value={form.content.conclusion}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                content: { ...prev.content, conclusion: event.target.value }
              }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">{t('admin.facts.field_tags')}</p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const checked = form.tag_ids.includes(String(tag.id))
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(String(tag.id))}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    checked ? 'border-slate-800 bg-slate-800 text-white' : 'border-slate-300 text-slate-700'
                  }`}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 p-3">
          <p className="mb-2 text-sm font-medium text-slate-700">{t('admin.media.title')}</p>
          <div className="grid gap-2 md:grid-cols-[1fr,1fr,1fr,140px]">
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImageUpload((prev) => ({ ...prev, file: event.target.files?.[0] ?? null }))
              }
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={imageUpload.alt}
              onChange={(event) => setImageUpload((prev) => ({ ...prev, alt: event.target.value }))}
              placeholder={t('admin.media.alt_placeholder')}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              value={imageUpload.caption}
              onChange={(event) => setImageUpload((prev) => ({ ...prev, caption: event.target.value }))}
              placeholder={t('admin.media.caption_placeholder')}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleUploadImage}
              disabled={uploadMutation.isPending}
              className="rounded bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
            >
              {t('admin.media.upload_button')}
            </button>
          </div>

          {previewUrl ? (
            <img src={previewUrl} alt="preview" className="mt-3 h-28 rounded border border-slate-200 object-cover" />
          ) : null}

          {form.content.images.length > 0 ? (
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              {form.content.images.map((image, index) => (
                <div key={`${image.url}-${index}`} className="rounded border border-slate-200 p-2">
                  <img src={image.url} alt={image.alt || `image-${index}`} className="h-20 w-full object-cover" />
                  <button
                    type="button"
                    className="mt-2 text-xs text-red-600 underline"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          images: prev.content.images.filter((_, imageIndex) => imageIndex !== index)
                        }
                      }))
                    }
                  >
                    {t('comments.delete')}
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={saveFactMutation.isPending}
          className="rounded bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
        >
          {t('admin.facts.save_button')}
        </button>
      </form>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
        <label className="text-sm text-slate-700">
          {t('admin.facts.filter_status')}
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, status: event.target.value, page: 1 }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            {factStatusOptions.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700">
          {t('admin.facts.filter_category')}
          <select
            value={filters.category_id}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, category_id: event.target.value, page: 1 }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          >
            <option value="">{t('admin.facts.all_categories')}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-slate-700 md:col-span-2">
          {t('admin.facts.filter_search')}
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))
            }
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      {factsQuery.isLoading ? (
        <p className="rounded bg-white p-4 text-sm text-slate-600">{t('common.loading')}</p>
      ) : null}

      {factsQuery.error ? (
        <p className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {factsQuery.error?.message || t('admin.facts.load_list_failed')}
        </p>
      ) : null}

      {facts.length > 0 ? (
        <div className="space-y-3">
          {facts.map((fact) => {
            const statusDraft = statusDraftById[fact.id] ?? fact.status
            return (
              <article key={fact.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <h4 className="text-base font-semibold text-slate-800">{fact.title}</h4>
                <p className="mt-1 text-sm text-slate-600">{fact.short_fact}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {t('admin.facts.current_status')}: {t(`admin.facts.status.${fact.status}`)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(fact)}
                    className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700"
                  >
                    {t('admin.facts.edit_button')}
                  </button>

                  {userIsAdmin ? (
                    <>
                      <select
                        value={statusDraft}
                        onChange={(event) =>
                          setStatusDraftById((prev) => ({ ...prev, [fact.id]: event.target.value }))
                        }
                        className="rounded border border-slate-300 px-2 py-1.5 text-sm"
                      >
                        <option value="draft">{t('admin.facts.status.draft')}</option>
                        <option value="published">{t('admin.facts.status.published')}</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: fact.id,
                            payload: { status: statusDraft }
                          })
                        }
                        className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white"
                      >
                        {t('admin.facts.apply_status')}
                      </button>
                    </>
                  ) : null}
                </div>
              </article>
            )
          })}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              {t('common.prev')}
            </button>
            <span className="text-sm text-slate-600">
              {t('facts.page_info', `Page ${page} / ${totalPages}`)
                .replace('{page}', String(page))
                .replace('{total_pages}', String(totalPages))}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              className="rounded border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
