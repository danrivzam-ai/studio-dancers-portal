# Mi Studio — Portal de alumnas de Studio Dancers

PWA (React + Vite + Tailwind) donde alumnas y representantes consultan su estado de pago,
suben comprobantes de transferencia, ven su calendario de clases y sus reportes de ciclo.

Comparte la base Supabase con el panel Admin. Reglas de desarrollo: ver [CLAUDE.md](CLAUDE.md).

```bash
npm install
npm run dev     # desarrollo
npm run build   # producción (Vercel)
```

Variables de entorno: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
`VITE_TELEGRAM_TRANSFERS_BOT_TOKEN`, `VITE_TELEGRAM_TRANSFERS_CHAT_ID`.
