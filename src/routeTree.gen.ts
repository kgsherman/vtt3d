/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ScenesImport } from './routes/scenes'
import { Route as IndexImport } from './routes/index'
import { Route as GamesIndexImport } from './routes/games/index'
import { Route as ScenesSceneIdImport } from './routes/scenes_.$sceneId'
import { Route as GamesGameIdImport } from './routes/games/$gameId'

// Create/Update Routes

const ScenesRoute = ScenesImport.update({
  id: '/scenes',
  path: '/scenes',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const GamesIndexRoute = GamesIndexImport.update({
  id: '/games/',
  path: '/games/',
  getParentRoute: () => rootRoute,
} as any)

const ScenesSceneIdRoute = ScenesSceneIdImport.update({
  id: '/scenes_/$sceneId',
  path: '/scenes/$sceneId',
  getParentRoute: () => rootRoute,
} as any)

const GamesGameIdRoute = GamesGameIdImport.update({
  id: '/games/$gameId',
  path: '/games/$gameId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/scenes': {
      id: '/scenes'
      path: '/scenes'
      fullPath: '/scenes'
      preLoaderRoute: typeof ScenesImport
      parentRoute: typeof rootRoute
    }
    '/games/$gameId': {
      id: '/games/$gameId'
      path: '/games/$gameId'
      fullPath: '/games/$gameId'
      preLoaderRoute: typeof GamesGameIdImport
      parentRoute: typeof rootRoute
    }
    '/scenes_/$sceneId': {
      id: '/scenes_/$sceneId'
      path: '/scenes/$sceneId'
      fullPath: '/scenes/$sceneId'
      preLoaderRoute: typeof ScenesSceneIdImport
      parentRoute: typeof rootRoute
    }
    '/games/': {
      id: '/games/'
      path: '/games'
      fullPath: '/games'
      preLoaderRoute: typeof GamesIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/scenes': typeof ScenesRoute
  '/games/$gameId': typeof GamesGameIdRoute
  '/scenes/$sceneId': typeof ScenesSceneIdRoute
  '/games': typeof GamesIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/scenes': typeof ScenesRoute
  '/games/$gameId': typeof GamesGameIdRoute
  '/scenes/$sceneId': typeof ScenesSceneIdRoute
  '/games': typeof GamesIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/scenes': typeof ScenesRoute
  '/games/$gameId': typeof GamesGameIdRoute
  '/scenes_/$sceneId': typeof ScenesSceneIdRoute
  '/games/': typeof GamesIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/scenes' | '/games/$gameId' | '/scenes/$sceneId' | '/games'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/scenes' | '/games/$gameId' | '/scenes/$sceneId' | '/games'
  id:
    | '__root__'
    | '/'
    | '/scenes'
    | '/games/$gameId'
    | '/scenes_/$sceneId'
    | '/games/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  ScenesRoute: typeof ScenesRoute
  GamesGameIdRoute: typeof GamesGameIdRoute
  ScenesSceneIdRoute: typeof ScenesSceneIdRoute
  GamesIndexRoute: typeof GamesIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  ScenesRoute: ScenesRoute,
  GamesGameIdRoute: GamesGameIdRoute,
  ScenesSceneIdRoute: ScenesSceneIdRoute,
  GamesIndexRoute: GamesIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/scenes",
        "/games/$gameId",
        "/scenes_/$sceneId",
        "/games/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/scenes": {
      "filePath": "scenes.tsx"
    },
    "/games/$gameId": {
      "filePath": "games/$gameId.tsx"
    },
    "/scenes_/$sceneId": {
      "filePath": "scenes_.$sceneId.tsx"
    },
    "/games/": {
      "filePath": "games/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
