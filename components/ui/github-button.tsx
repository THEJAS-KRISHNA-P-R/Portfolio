"use client"

interface GitHubButtonProps {
  href: string
  frontText?: string
  topText?: string
}

export function GitHubButton({
  href,
  frontText = "Repo",
  topText = "GitHub →",
}: GitHubButtonProps) {
  return (
    <>
      <style jsx>{`
        .gh-btn {
          display: inline-flex;
          align-items: stretch;
          border: 1px solid rgba(0, 230, 118, 0.25);
          border-radius: 9999px;
          width: fit-content;
          cursor: pointer;
          text-decoration: none;
          background: rgba(10, 26, 20, 0.8);
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          overflow: hidden;
        }

        .gh-btn:hover {
          border-color: rgba(255, 77, 125, 0.6);
          box-shadow: inset 0 -2px 0 0 #ff4d7d, 0 4px 16px -4px rgba(255,77,125,0.25);
        }

        .gh-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 8px 0 10px;
          transition: color 0.25s ease;
        }

        .gh-icon svg {
          width: 13px;
          height: 13px;
          display: block;
        }

        .gh-btn:hover .gh-icon svg path {
          fill: #ff4d7d;
        }

        .cube-wrapper {
          perspective: 120px;
          width: 72px;
          height: 30px;
          overflow: hidden;
        }

        .cube {
          width: 72px;
          height: 30px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          transform: rotateX(0deg);
        }

        .gh-btn:hover .cube {
          transform: rotateX(-90deg);
        }

        .side {
          position: absolute;
          width: 72px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
          backface-visibility: hidden;
        }

        .front {
          background: transparent;
          color: #7aaa8a;
          transform: translateZ(15px);
        }

        .top {
          background: #ff4d7d;
          color: #fff;
          transform: rotateX(90deg) translateZ(15px);
        }
      `}</style>

      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="gh-btn"
      >
        <div className="gh-icon">
          <svg viewBox="0 0 24 24">
            <path
              d="M12 0.297C5.37 0.297 0 5.67 0 12.297C0 17.6 3.438 22.097 8.205 23.682C8.805 23.795 9.025 23.424 9.025 23.105C9.025 22.82 9.015 22.065 9.01 21.065C5.672 21.789 4.968 19.455 4.968 19.455C4.422 18.07 3.633 17.7 3.633 17.7C2.546 16.956 3.717 16.971 3.717 16.971C4.922 17.055 5.555 18.207 5.555 18.207C6.625 20.042 8.364 19.512 9.05 19.205C9.158 18.429 9.467 17.9 9.81 17.6C7.145 17.3 4.344 16.268 4.344 11.67C4.344 10.36 4.809 9.29 5.579 8.45C5.444 8.147 5.039 6.927 5.684 5.274C5.684 5.274 6.689 4.952 8.984 6.504C9.944 6.237 10.964 6.105 11.984 6.099C13.004 6.105 14.024 6.237 14.984 6.504C17.264 4.952 18.269 5.274 18.269 5.274C18.914 6.927 18.509 8.147 18.389 8.45C19.154 9.29 19.619 10.36 19.619 11.67C19.619 16.28 16.814 17.295 14.144 17.59C14.564 17.95 14.954 18.686 14.954 19.81C14.954 21.416 14.939 22.706 14.939 23.096C14.939 23.411 15.149 23.786 15.764 23.666C20.565 22.092 24 17.592 24 12.297C24 5.67 18.627 0.297 12 0.297Z"
              fill="#7aaa8a"
            />
          </svg>
        </div>
        <div className="cube-wrapper">
          <div className="cube">
            <span className="side front">{frontText}</span>
            <span className="side top">{topText}</span>
          </div>
        </div>
      </a>
    </>
  )
}
