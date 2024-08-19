import express from 'express'
import routeGuest from './routes/guest.routes'
import routeEvent from './routes/event.routes'
import routeUser from './routes/user.routes'
//@ts-ignore
import cors from 'cors'
import './db'
const app = express()

app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(cors({
    origin: "*",
}));



app.use(routeEvent)
app.use(routeUser)
app.use(routeGuest)

app.listen(process.env.PORT || 4000, () => {
    console.log('Server listen on port', 4000)
})

// TO DO ✅ ❌ ⏳ ❓
/**
 * 
 */