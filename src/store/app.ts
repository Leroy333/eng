import { createStore, createEvent } from 'effector'

export type AppPage = 'onboarding' | 'dashboard'

export const $currentPage = createStore<AppPage>('onboarding')
export const $newWordsCount = createStore<number>(20)
export const $userName = createStore<string>('Пользователь')

export const setCurrentPage = createEvent<AppPage>()
export const setNewWordsCount = createEvent<number>()
export const setUserName = createEvent<string>()

$currentPage.on(setCurrentPage, (_, page) => page)
$newWordsCount.on(setNewWordsCount, (_, count) => count)
$userName.on(setUserName, (_, name) => name)
