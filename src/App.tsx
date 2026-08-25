import { useEffect, useState } from "react"
import { DashboardView } from "@/views/DashboardView"
import { EditorView } from "@/views/EditorView"
import { seedLocalPrivateResumes } from "@/utils/seedLocalPrivateResumes"

type Route =
  | {
      view: "dashboard"
    }
  | {
      view: "editor"
      resumeId: string
    }

function parseRoute(): Route {
  const match = window.location.hash.match(/^#\/resume\/([^/]+)$/)

  if (match?.[1]) {
    return {
      view: "editor",
      resumeId: decodeURIComponent(match[1]),
    }
  }

  return {
    view: "dashboard",
  }
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute())

  useEffect(() => {
    const handleRouteChange = () => setRoute(parseRoute())
    window.addEventListener("hashchange", handleRouteChange)
    return () => window.removeEventListener("hashchange", handleRouteChange)
  }, [])

  useEffect(() => {
    void seedLocalPrivateResumes().catch(() => undefined)
  }, [])

  if (route.view === "editor") {
    return <EditorView key={route.resumeId} resumeId={route.resumeId} />
  }

  return <DashboardView />
}

export default App
