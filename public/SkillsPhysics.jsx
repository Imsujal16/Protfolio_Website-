import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"

// ---------------------------------------------------------------------------
// Skill data, grouped the same way as the "Tools I work with" screenshot.
// type: "image" -> renders a logo (Devicon CDN). type: "text" -> renders a
// label pill, for tools/concepts that don't have an official logo.
// color drives the border/glow so the falling pieces still read as grouped
// by category even though they're no longer in static rows.
// ---------------------------------------------------------------------------
const CAT = {
    lang: "#38bdf8", // Languages
    fw: "#a78bfa", // Frameworks & Libraries
    design: "#f472b6", // Design Tools
    dev: "#34d399", // Dev Tools & Databases
    concept: "#fb923c", // Concepts
}

const DEVICON = (path) =>
    `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${path}.svg`

const SKILLS = [
    // Languages
    { label: "Python", type: "image", src: DEVICON("python/python-original"), color: CAT.lang },
    { label: "JavaScript", type: "image", src: DEVICON("javascript/javascript-original"), color: CAT.lang },
    { label: "Java", type: "image", src: DEVICON("java/java-original"), color: CAT.lang },
    { label: "C", type: "image", src: DEVICON("c/c-original"), color: CAT.lang },
    { label: "C++", type: "image", src: DEVICON("cplusplus/cplusplus-original"), color: CAT.lang },
    { label: "HTML", type: "image", src: DEVICON("html5/html5-original"), color: CAT.lang },
    { label: "CSS", type: "image", src: DEVICON("css3/css3-original"), color: CAT.lang },
    { label: "SQL", type: "text", color: CAT.lang },

    // Frameworks & Libraries
    { label: "React.js", type: "image", src: DEVICON("react/react-original"), color: CAT.fw },
    { label: "Node.js", type: "image", src: DEVICON("nodejs/nodejs-original"), color: CAT.fw },
    { label: "Express.js", type: "image", src: DEVICON("express/express-original"), color: CAT.fw, invert: true },
    { label: "EJS", type: "text", color: CAT.fw },
    { label: "Pandas", type: "image", src: DEVICON("pandas/pandas-original"), color: CAT.fw },
    { label: "NumPy", type: "image", src: DEVICON("numpy/numpy-original"), color: CAT.fw },
    { label: "Matplotlib", type: "image", src: DEVICON("matplotlib/matplotlib-original"), color: CAT.fw },
    { label: "Seaborn", type: "text", color: CAT.fw },

    // Design Tools
    { label: "Figma", type: "image", src: DEVICON("figma/figma-original"), color: CAT.design },
    { label: "Canva", type: "text", color: CAT.design },

    // Dev Tools & Databases
    { label: "MySQL 8", type: "image", src: DEVICON("mysql/mysql-original"), color: CAT.dev },
    { label: "Git", type: "image", src: DEVICON("git/git-original"), color: CAT.dev },
    { label: "GitHub", type: "image", src: DEVICON("github/github-original"), color: CAT.dev, invert: true },
    { label: "VS Code", type: "image", src: DEVICON("vscode/vscode-original"), color: CAT.dev },
    { label: "Android Studio", type: "image", src: DEVICON("androidstudio/androidstudio-original"), color: CAT.dev },
    { label: "Jupyter", type: "image", src: DEVICON("jupyter/jupyter-original"), color: CAT.dev },

    // Concepts — no official logos, rendered as text pills
    { label: "OOP", type: "text", color: CAT.concept },
    { label: "DSA", type: "text", color: CAT.concept },
    { label: "Android Dev", type: "text", color: CAT.concept },
    { label: "API Integration", type: "text", color: CAT.concept },
    { label: "UI/UX Design", type: "text", color: CAT.concept },
]

const M = Matter

function makeWalls(bounding, world, opts) {
    const { width: w, height: h } = bounding
    const t = 200
    const walls = []
    if (opts.top) walls.push(M.Bodies.rectangle(w / 2, -t / 2, w + 2 * t, t, { isStatic: true }))
    if (opts.bottom) walls.push(M.Bodies.rectangle(w / 2, h + t / 2, w + 2 * t, t, { isStatic: true }))
    if (opts.left) walls.push(M.Bodies.rectangle(-t / 2, h / 2, t, h + 2 * t, { isStatic: true }))
    if (opts.right) walls.push(M.Bodies.rectangle(w + t / 2, h / 2, t, h + 2 * t, { isStatic: true }))
    M.Composite.add(world, walls)
    return walls
}

// Rough pill width so text items don't clip.
const pillWidth = (label) => Math.max(96, 34 + label.length * 11)

// One skill's visual — reused by both the live physics body and the
// prefers-reduced-motion static grid so the two views stay in sync.
function SkillTile({ item, imageSize, positioned }) {
    return (
        <div
            data-skill-body={positioned ? "" : undefined}
            style={{
                position: positioned ? "absolute" : "relative",
                visibility: positioned ? "hidden" : "visible",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: item.type === "text" ? pillWidth(item.label) : imageSize,
                height: item.type === "text" ? 54 : imageSize,
                borderRadius: item.type === "text" ? 14 : "50%",
                background: "#121319",
                border: `1.5px solid ${item.color}55`,
                boxShadow: `0 0 22px -6px ${item.color}66`,
                cursor: positioned ? "grab" : "default",
                userSelect: "none",
            }}
            draggable={false}
        >
            {item.type === "text" ? (
                <span
                    style={{
                        color: item.color,
                        fontFamily: "monospace",
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: 0.3,
                        padding: "0 10px",
                        textAlign: "center",
                        pointerEvents: "none",
                    }}
                >
                    {item.label}
                </span>
            ) : (
                <img
                    src={item.src}
                    alt={item.label}
                    draggable={false}
                    style={{
                        width: "58%",
                        height: "58%",
                        objectFit: "contain",
                        filter: item.invert ? "invert(1)" : undefined,
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    )
}

export default function SkillsPhysics({
    items = SKILLS,
    imageSize = 88,
    friction = 3,
    mouseEnable = true,
    dropStaggerMs = 55,
    style,
}) {
    const containerRef = useRef(null)
    const rafRef = useRef(0)
    const [reducedMotion, setReducedMotion] = useState(false)
    const [isActive, setIsActive] = useState(false)

    // Respect prefers-reduced-motion: no physics, no cascade — static grid instead.
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        setReducedMotion(mq.matches)
        const onChange = () => setReducedMotion(mq.matches)
        mq.addEventListener("change", onChange)
        return () => mq.removeEventListener("change", onChange)
    }, [])

    // The cascade only starts once the section scrolls into view — this is
    // what makes it feel like a transition rather than a page-load gimmick.
    useEffect(() => {
        const container = containerRef.current
        if (!container || reducedMotion) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsActive(true)
                    observer.disconnect() // fire once, don't replay on every scroll pass
                }
            },
            { threshold: 0.25 }
        )
        observer.observe(container)
        return () => observer.disconnect()
    }, [reducedMotion])

    useEffect(() => {
        if (!isActive || reducedMotion) return
        const container = containerRef.current
        if (!container) return

        const engine = M.Engine.create({ enableSleeping: false, gravity: { x: 0, y: 1 } })
        const bounding = container.getBoundingClientRect()
        makeWalls(bounding, engine.world, { top: true, bottom: true, left: true, right: true })

        let mouseConstraint = null
        const onLeave = () => mouseConstraint?.mouse?.mouseup(new Event("mouseup"))
        if (mouseEnable) {
            const mouse = M.Mouse.create(container)
            mouseConstraint = M.MouseConstraint.create(engine, {
                mouse,
                constraint: { angularStiffness: 0, stiffness: 0.9 },
            })
            M.Composite.add(engine.world, mouseConstraint)
            const el = mouseConstraint.mouse.element
            el.removeEventListener("mousewheel", mouseConstraint.mouse.mousewheel)
            el.removeEventListener("DOMMouseScroll", mouseConstraint.mouse.mousewheel)
            container.addEventListener("mouseleave", onLeave)
        }

        const bodyOpts = { friction: Math.max(1, Math.min(10, friction)) / 10, frictionAir: 0.02, restitution: 0.35 }
        const made = []
        items.forEach((item, i) => {
            const x = ((i + 0.5) / items.length) * bounding.width
            const y = -i * 40 - 40 // stagger start heights so they cascade in, not all at once
            const body =
                item.type === "text"
                    ? M.Bodies.rectangle(x, y, pillWidth(item.label), 54, bodyOpts)
                    : M.Bodies.circle(x, y, imageSize / 2, bodyOpts)
            made.push(body)
        })

        // Add bodies with a short stagger so they fall in like a cascade
        // rather than dropping as a single flat sheet.
        const timeouts = []
        made.forEach((body, i) => {
            const t = setTimeout(() => M.Composite.add(engine.world, body), i * dropStaggerMs)
            timeouts.push(t)
        })

        const els = Array.from(container.querySelectorAll("[data-skill-body]"))

        const update = () => {
            rafRef.current = requestAnimationFrame(update)
            for (let i = 0; i < made.length; i++) {
                const el = els[i]
                if (!el) continue
                const { position, angle } = made[i]
                el.style.visibility = "visible"
                el.style.left = `${position.x}px`
                el.style.top = `${position.y}px`
                el.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`
            }
            M.Engine.update(engine)
        }
        update()

        return () => {
            cancelAnimationFrame(rafRef.current)
            timeouts.forEach(clearTimeout)
            if (mouseEnable) container.removeEventListener("mouseleave", onLeave)
            M.World.clear(engine.world, false)
            M.Engine.clear(engine)
        }
    }, [isActive, reducedMotion, items, imageSize, friction, mouseEnable, dropStaggerMs])

    if (reducedMotion) {
        return (
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 14,
                    justifyContent: "center",
                    alignContent: "flex-start",
                    ...style,
                }}
            >
                {items.map((item, i) => (
                    <SkillTile key={item.label + i} item={item} imageSize={imageSize} positioned={false} />
                ))}
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
        >
            {items.map((item, i) => (
                <SkillTile key={item.label + i} item={item} imageSize={imageSize} positioned={true} />
            ))}
        </div>
    )
}
