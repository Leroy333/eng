import { createStore, createEvent } from 'effector'

export type AppPage = 'onboarding' | 'dashboard' | 'wordCards'

export const $currentPage = createStore<AppPage>('onboarding')
export const $newWordsCount = createStore<number>(20)
export const $userName = createStore<string>('Пользователь')
export const $selectedTopicId = createStore<string | null>(null)

export const setCurrentPage = createEvent<AppPage>()
export const setNewWordsCount = createEvent<number>()
export const setUserName = createEvent<string>()
export const setSelectedTopicId = createEvent<string | null>()

$currentPage.on(setCurrentPage, (_, page) => page)
$newWordsCount.on(setNewWordsCount, (_, count) => count)
$userName.on(setUserName, (_, name) => name)
$selectedTopicId.on(setSelectedTopicId, (_, topicId) => topicId)
