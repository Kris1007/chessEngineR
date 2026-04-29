import { Hono } from 'hono'

const app = new Hono()

app.get('/api/books', (c) => {
  return c.json([
    {id: 1, title: '1984', author: 'George Orwell'},
    
  ])
})

export default app
