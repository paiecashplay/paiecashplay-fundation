// Construction dynamique de l'URL de base de données
export function getDatabaseUrl(): string {
  const host = process.env.DB_HOST || 'localhost'
  const user = process.env.DB_USER || 'root'
  const port = process.env.DB_PORT || '3306'
  const password = process.env.DB_PASSWORD || ''
  const name = process.env.DB_NAME || 'bd-donation'
  
  return `postgresql://${user}:${password}@${host}:${port}/${name}`
}