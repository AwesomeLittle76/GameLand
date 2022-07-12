import {useRoutes} from 'react-router-dom'

import './App.css'
import routes from './route/router'

function App() {
  return useRoutes(routes)
}

export default App
