import React, {Suspense} from 'react'

import type {RouteObject} from 'react-router-dom'
import Index from '../pages/index'

// React.lazy 配合 import() 实现懒加载
const About = React.lazy(() => import('../pages/about'))
const MineSweeper = React.lazy(() => import('../pages/minesweeper'))

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Index />,
  },
  {
    path: '/about',
    element: (
      <Suspense fallback={<span>loading component</span>}>
        <About />
      </Suspense>
    ),
  },
  {
    path: '/minesweeper',
    element: (
      <Suspense fallback={<span>loading component</span>}>
        <MineSweeper />
      </Suspense>
    ),
  },
]

export default routes
