# Bajaj FSD Test

SRM Full Stack Challenge Round 1.

- API: https://bajaj-fsd-backend.vercel.app/bfhl
- Site: https://bajaj-fsd-frontend.vercel.app

POST an array of edges like `A->B` and you get back the parsed trees, any cycles, invalid entries and duplicates.

Stack is Node + Express for the backend, React + Vite for the frontend. Both deployed on Vercel.

## Running it

```bash
cd backend && npm i && npm run dev
cd frontend && npm i && npm run dev
```

Set `VITE_API_URL` in `frontend/.env` to your backend URL.
