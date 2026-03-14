import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useI18n } from '../utils/i18n'
import { useToast } from '../hooks/toastContext'
import {
  createCategory,
  deleteCategoryById,
  getCategories,
  updateCategoryById,
  upsertCategoryTranslation
} from '../services/categoryService'
import { createTag, deleteTagById, getTags, updateTagById } from '../services/tagService'

const EMPTY_CATEGORY_FORM = {
  name: '',
  slug: '',
  description: '',
  icon: ''
}

const EMPTY_TRANSLATION_FORM = {
  category_id: '',
  language: 'en',
  name: '',
  description: ''
}

const EMPTY_TAG_FORM = {
  name: '',
  slug: ''
}

export default function AdminTaxonomyPage() {
  const { t, language } = useI18n()
  const { pushToast } = useToast()
  const queryClient = useQueryClient()

  const [categoryCreateForm, setCategoryCreateForm] = useState(EMPTY_CATEGORY_FORM)
  const [categoryEditDraftById, setCategoryEditDraftById] = useState({})
  const [translationForm, setTranslationForm] = useState(EMPTY_TRANSLATION_FORM)
  const [tagCreateForm, setTagCreateForm] = useState(EMPTY_TAG_FORM)
  const [tagEditDraftById, setTagEditDraftById] = useState({})

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories', language],
    queryFn: () =>
      getCategories(
        { language },
        {
          errorFallbackMessage: t('admin.taxonomy.categories_load_failed')
        }
      )
  })

  const tagsQuery = useQuery({
    queryKey: ['admin-tags'],
    queryFn: () =>
      getTags({
        errorFallbackMessage: t('admin.taxonomy.tags_load_failed')
      })
  })

  const createCategoryMutation = useMutation({
    mutationFn: (payload) =>
      createCategory(payload, { errorFallbackMessage: t('admin.taxonomy.category_create_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.category_create_success') })
      setCategoryCreateForm(EMPTY_CATEGORY_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.category_create_failed') })
    }
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ categoryId, payload }) =>
      updateCategoryById(categoryId, payload, { errorFallbackMessage: t('admin.taxonomy.category_update_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.category_update_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.category_update_failed') })
    }
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (categoryId) =>
      deleteCategoryById(categoryId, { errorFallbackMessage: t('admin.taxonomy.category_delete_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.category_delete_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.category_delete_failed') })
    }
  })

  const translationMutation = useMutation({
    mutationFn: (payload) =>
      upsertCategoryTranslation(payload.category_id, payload.language, payload.body, {
        errorFallbackMessage: t('admin.taxonomy.category_translation_failed')
      }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.category_translation_success') })
      setTranslationForm(EMPTY_TRANSLATION_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.category_translation_failed') })
    }
  })

  const createTagMutation = useMutation({
    mutationFn: (payload) => createTag(payload, { errorFallbackMessage: t('admin.taxonomy.tag_create_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.tag_create_success') })
      setTagCreateForm(EMPTY_TAG_FORM)
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.tag_create_failed') })
    }
  })

  const updateTagMutation = useMutation({
    mutationFn: ({ tagId, payload }) =>
      updateTagById(tagId, payload, { errorFallbackMessage: t('admin.taxonomy.tag_update_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.tag_update_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.tag_update_failed') })
    }
  })

  const deleteTagMutation = useMutation({
    mutationFn: (tagId) => deleteTagById(tagId, { errorFallbackMessage: t('admin.taxonomy.tag_delete_failed') }),
    onSuccess: () => {
      pushToast({ type: 'success', message: t('admin.taxonomy.tag_delete_success') })
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] })
    },
    onError: (error) => {
      pushToast({ type: 'error', message: error?.message || t('admin.taxonomy.tag_delete_failed') })
    }
  })

  const categories = categoriesQuery.data ?? []
  const tags = tagsQuery.data ?? []

  const submitCreateCategory = (event) => {
    event.preventDefault()
    createCategoryMutation.mutate({
      name: categoryCreateForm.name.trim(),
      ...(categoryCreateForm.slug.trim() ? { slug: categoryCreateForm.slug.trim() } : {}),
      description: categoryCreateForm.description.trim() || null,
      icon: categoryCreateForm.icon.trim() || null
    })
  }

  const submitUpdateCategory = (category) => {
    const categoryId = String(category.id)
    const draft = categoryEditDraftById[categoryId] ?? {
      name: category.name,
      slug: category.slug || '',
      description: category.description || '',
      icon: category.icon || ''
    }

    updateCategoryMutation.mutate({
      categoryId,
      payload: {
        name: draft.name.trim(),
        ...(draft.slug.trim() ? { slug: draft.slug.trim() } : {}),
        description: draft.description.trim() || null,
        icon: draft.icon.trim() || null
      }
    })
  }

  const submitDeleteCategory = (category) => {
    const confirmed = window.confirm(t('admin.taxonomy.category_delete_confirm'))
    if (!confirmed) {
      return
    }
    deleteCategoryMutation.mutate(String(category.id))
  }

  const submitTranslation = (event) => {
    event.preventDefault()
    translationMutation.mutate({
      category_id: translationForm.category_id,
      language: translationForm.language,
      body: {
        name: translationForm.name.trim(),
        description: translationForm.description.trim() || null
      }
    })
  }

  const submitCreateTag = (event) => {
    event.preventDefault()
    createTagMutation.mutate({
      name: tagCreateForm.name.trim(),
      ...(tagCreateForm.slug.trim() ? { slug: tagCreateForm.slug.trim() } : {})
    })
  }

  const submitUpdateTag = (tag) => {
    const tagId = String(tag.id)
    const draft = tagEditDraftById[tagId] ?? {
      name: tag.name,
      slug: tag.slug || ''
    }

    updateTagMutation.mutate({
      tagId,
      payload: {
        name: draft.name.trim(),
        ...(draft.slug.trim() ? { slug: draft.slug.trim() } : {})
      }
    })
  }

  const submitDeleteTag = (tag) => {
    const confirmed = window.confirm(t('admin.taxonomy.tag_delete_confirm'))
    if (!confirmed) {
      return
    }
    deleteTagMutation.mutate(String(tag.id))
  }

  return (
    <section className="space-y-5">
      <header>
        <h2 className="text-xl font-semibold text-slate-800">{t('admin.taxonomy.title')}</h2>
        <p className="mt-1 text-sm text-slate-600">{t('admin.taxonomy.subtitle')}</p>
      </header>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-800">{t('admin.taxonomy.categories_title')}</h3>

        <form onSubmit={submitCreateCategory} className="grid gap-3 md:grid-cols-4">
          <input
            required
            value={categoryCreateForm.name}
            onChange={(event) =>
              setCategoryCreateForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder={t('admin.taxonomy.category_name')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={categoryCreateForm.slug}
            onChange={(event) =>
              setCategoryCreateForm((prev) => ({ ...prev, slug: event.target.value }))
            }
            placeholder={t('admin.taxonomy.slug_optional')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={categoryCreateForm.description}
            onChange={(event) =>
              setCategoryCreateForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder={t('admin.taxonomy.description_optional')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={categoryCreateForm.icon}
            onChange={(event) =>
              setCategoryCreateForm((prev) => ({ ...prev, icon: event.target.value }))
            }
            placeholder={t('admin.taxonomy.icon_optional')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={createCategoryMutation.isPending}
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            >
              {t('admin.taxonomy.category_create_button')}
            </button>
          </div>
        </form>

        {categories.map((category) => {
          const categoryId = String(category.id)
          const draft = categoryEditDraftById[categoryId] ?? {
            name: category.name,
            slug: category.slug || '',
            description: category.description || '',
            icon: category.icon || ''
          }

          return (
            <article key={categoryId} className="grid gap-2 rounded border border-slate-200 p-3 md:grid-cols-[1fr,1fr,2fr,2fr,auto]">
              <input
                value={draft.name}
                onChange={(event) =>
                  setCategoryEditDraftById((prev) => ({
                    ...prev,
                    [categoryId]: { ...draft, name: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                value={draft.slug}
                onChange={(event) =>
                  setCategoryEditDraftById((prev) => ({
                    ...prev,
                    [categoryId]: { ...draft, slug: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                value={draft.description}
                onChange={(event) =>
                  setCategoryEditDraftById((prev) => ({
                    ...prev,
                    [categoryId]: { ...draft, description: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                value={draft.icon}
                onChange={(event) =>
                  setCategoryEditDraftById((prev) => ({
                    ...prev,
                    [categoryId]: { ...draft, icon: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => submitUpdateCategory(category)}
                  disabled={updateCategoryMutation.isPending}
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {t('admin.taxonomy.save_button')}
                </button>
                <button
                  type="button"
                  onClick={() => submitDeleteCategory(category)}
                  disabled={deleteCategoryMutation.isPending}
                  className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                >
                  {t('admin.taxonomy.delete_button')}
                </button>
              </div>
            </article>
          )
        })}

        <form onSubmit={submitTranslation} className="grid gap-3 rounded border border-slate-200 p-3 md:grid-cols-4">
          <select
            value={translationForm.category_id}
            onChange={(event) =>
              setTranslationForm((prev) => ({ ...prev, category_id: event.target.value }))
            }
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="">{t('admin.taxonomy.translation_select_category')}</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={translationForm.language}
            onChange={(event) =>
              setTranslationForm((prev) => ({ ...prev, language: event.target.value }))
            }
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="en">{t('language.en')}</option>
            <option value="vi">{t('language.vi')}</option>
          </select>
          <input
            required
            value={translationForm.name}
            onChange={(event) =>
              setTranslationForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder={t('admin.taxonomy.translation_name')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={translationForm.description}
            onChange={(event) =>
              setTranslationForm((prev) => ({ ...prev, description: event.target.value }))
            }
            placeholder={t('admin.taxonomy.translation_description_optional')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="md:col-span-4">
            <button
              type="submit"
              disabled={translationMutation.isPending}
              className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
            >
              {t('admin.taxonomy.translation_save_button')}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-800">{t('admin.taxonomy.tags_title')}</h3>

        <form onSubmit={submitCreateTag} className="grid gap-3 md:grid-cols-3">
          <input
            required
            value={tagCreateForm.name}
            onChange={(event) => setTagCreateForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder={t('admin.taxonomy.tag_name')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            value={tagCreateForm.slug}
            onChange={(event) => setTagCreateForm((prev) => ({ ...prev, slug: event.target.value }))}
            placeholder={t('admin.taxonomy.slug_optional')}
            className="rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createTagMutation.isPending}
            className="rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          >
            {t('admin.taxonomy.tag_create_button')}
          </button>
        </form>

        {tags.map((tag) => {
          const tagId = String(tag.id)
          const draft = tagEditDraftById[tagId] ?? {
            name: tag.name,
            slug: tag.slug || ''
          }

          return (
            <article key={tagId} className="grid gap-2 rounded border border-slate-200 p-3 md:grid-cols-[2fr,2fr,auto]">
              <input
                value={draft.name}
                onChange={(event) =>
                  setTagEditDraftById((prev) => ({
                    ...prev,
                    [tagId]: { ...draft, name: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <input
                value={draft.slug}
                onChange={(event) =>
                  setTagEditDraftById((prev) => ({
                    ...prev,
                    [tagId]: { ...draft, slug: event.target.value }
                  }))
                }
                className="rounded border border-slate-300 px-2 py-1.5 text-sm"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => submitUpdateTag(tag)}
                  disabled={updateTagMutation.isPending}
                  className="rounded border border-slate-300 px-3 py-2 text-sm"
                >
                  {t('admin.taxonomy.save_button')}
                </button>
                <button
                  type="button"
                  onClick={() => submitDeleteTag(tag)}
                  disabled={deleteTagMutation.isPending}
                  className="rounded border border-red-300 px-3 py-2 text-sm text-red-700"
                >
                  {t('admin.taxonomy.delete_button')}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
