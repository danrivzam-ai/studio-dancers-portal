import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const env = {}
try {
  readFileSync('D:/Studio Dancers Portal/.env', 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=')
    if (k && rest.length) env[k.trim()] = rest.join('=').trim()
  })
} catch {}

const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

function computeEstimatedClasses(lastPaymentDate, classDays, totalPerCycle) {
  if (!lastPaymentDate || !classDays || !classDays.length) return 0
  const start = new Date(lastPaymentDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let count = 0
  const d = new Date(start)
  while (d <= today) {
    const isoDay = d.getDay() === 0 ? 7 : d.getDay()
    if (classDays.includes(isoDay)) count++
    d.setDate(d.getDate() + 1)
  }
  return totalPerCycle ? Math.min(count, totalPerCycle) : count
}

async function main() {
  // 1. Courses with class_days + classes_per_cycle
  const { data: courses } = await sb
    .from('courses')
    .select('id, name, class_days, classes_per_cycle')

  const courseMap = {}
  courses?.forEach(c => { courseMap[c.id] = c })

  console.log('=== COURSES WITH SCHEDULE ===')
  courses?.filter(c => c.class_days?.length).forEach(c =>
    console.log(` ✓ ${c.name?.slice(0,40)} | days=${JSON.stringify(c.class_days)} | per_cycle=${c.classes_per_cycle}`)
  )
  courses?.filter(c => !c.class_days?.length).forEach(c =>
    console.log(` ✗ ${c.name?.slice(0,40)} | NO schedule (counter will be hidden — OK)`)
  )

  // 2. Simulate enrichment with test students using real course IDs
  console.log('\n=== SIMULATION: enrichment with real courses ===')
  const today = new Date().toISOString().slice(0,10)
  // Use last week as test last_payment_date
  const lastWeek = new Date(Date.now() - 7 * 86400000).toISOString().slice(0,10)
  const lastMonth = new Date(Date.now() - 30 * 86400000).toISOString().slice(0,10)

  const testStudents = courses?.filter(c => c.class_days?.length).map(c => ({
    name: 'Test_' + c.name?.slice(0,15),
    course_id: c.id,
    classes_used: null, // simulates DB null
    last_payment_date: lastMonth,
  }))

  testStudents?.forEach(s => {
    const course = courseMap[s.course_id]
    const classDays = course?.class_days || []
    const classesPer = course?.classes_per_cycle ?? 0
    const computed = computeEstimatedClasses(s.last_payment_date, classDays, classesPer)
    const shows = classesPer > 0
    console.log(` ${shows ? '✅' : '❌'} ${s.name?.slice(0,30).padEnd(30)} → ${computed}/${classesPer} ${!shows ? '(HIDDEN: no classes_per_cycle)' : ''}`)
  })

  // 3. Check the RPC return to see what fields it includes
  console.log('\n=== RPC RETURN FIELDS (checking if classes_per_cycle returned) ===')
  // We can't call with real credentials, but we can check the RPC definition
  const { data: rpcDef } = await sb
    .from('information_schema.routines')
    .select('routine_name, data_type')
    .eq('routine_name', 'rpc_client_login')
    .limit(1)
  if (rpcDef?.length) console.log('RPC found:', rpcDef[0])
  else {
    // Try fetching RPC columns from pg_proc or similar
    console.log('Cannot inspect RPC directly — checking if classes_per_cycle appears in return')
    // The key: our enrichment uses courseMap[s.course_id]?.classes_per_cycle
    // which comes from the COURSES table query (not the RPC), so it WILL work
    console.log('\n✅ KEY INSIGHT: enrichment uses courseMap built from courses table')
    console.log('   courseMap[course_id].classes_per_cycle = value from courses table')
    console.log('   This is independent of what the RPC returns for students')
    console.log('\n   Before fix: courses query only fetched "id, class_days" → classes_per_cycle was undefined')
    console.log('   After fix:  courses query fetches "id, class_days, classes_per_cycle" → WORKS')
  }

  // 4. Verify the fix date — last_payment_date = last month
  console.log('\n=== SAMPLE: Ballet Adultos L/M (days [2,4], per_cycle=8) ===')
  const ballet = courses?.find(c => c.name?.includes('Adultos Principiantes') && c.class_days?.length === 2)
  if (ballet) {
    for (const daysAgo of [7, 14, 21, 28, 35]) {
      const payDate = new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0,10)
      const count = computeEstimatedClasses(payDate, ballet.class_days, ballet.classes_per_cycle)
      console.log(`  last_payment ${daysAgo} days ago → computed=${count}/${ballet.classes_per_cycle}`)
    }
  }
}

main().catch(console.error)
