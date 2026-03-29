import { WorksheetShell } from '@/components/WorksheetShell'
import { AmbientBackground } from '@/components/AmbientBackground'
import { RitualOpening } from '@/components/RitualOpening'

export default function Home() {
  return (
    <>
      <AmbientBackground />
      <RitualOpening>
        <WorksheetShell />
      </RitualOpening>
    </>
  )
}
