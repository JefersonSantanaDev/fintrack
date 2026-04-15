import { Toaster as Sonner, ToasterProps } from "sonner"
import { useEffect, useState } from "react"

function Toaster({ ...props }: ToasterProps) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") {
      return "dark"
    }

    return window.localStorage.getItem("fintrack-theme-mode") === "light"
      ? "light"
      : "dark"
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setTheme(
        root.getAttribute("data-theme") === "clickhouse-light"
          ? "light"
          : "dark"
      )
    })

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] })
    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--background)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
