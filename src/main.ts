import './styles/chyron.css'
import { ChyronApp } from './app'

const app = new ChyronApp(document.body)
app.start().catch(console.error)
