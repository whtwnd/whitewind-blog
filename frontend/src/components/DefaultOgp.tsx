import { CSSProperties, FC } from 'react'

export interface IDefaultOgpProps {
  title: string
  displayName: string
  handle: string
  avatar?: string
}

export const DefaultOgp: FC<IDefaultOgpProps> = ({ title, displayName, handle, avatar }) => {
  let titleClass = 0
  if (title.length < 50) {
    titleClass = 0
  } else if (title.length < 100) {
    titleClass = 1
  } else {
    titleClass = 2
  }
  // const titleFontSize = ["text-8xl", "text-6xl", "text-4xl"][titleClass]
  const titleFontSize = ['6rem', '3.75rem', '2.25rem'][titleClass]
  const handleFontSize = ['3rem', '1.875rem', '1.25rem'][titleClass]
  const prefix = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://whtwnd.com'

  const imgStyle: CSSProperties = {
    width: '70%',
    borderRadius: 9999
  }
  return (
    <div style={{
      width: 1200,
      height: 630,
      minHeight: 630,
      position: 'relative',
      backgroundColor: '#0c4a6e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}
    >
      <div style={{
        width: 400,
        display: 'flex',
        justifyContent: 'center'
      }}
      >
        {
                avatar !== undefined
                  ? <img
                      src={avatar}
                      style={imgStyle}
                    />
                  : (
                    <svg style={{ fill: '#9ca3af', color: '#9ca3af', stroke: '#9ca3af' }} width='330' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'>
                      <path style={{ fill: '#9ca3af', color: '#9ca3af', stroke: '#9ca3af' }} fillRule='evenodd' d='M12 20a7.966 7.966 0 0 1-5.002-1.756l.002.001v-.683c0-1.794 1.492-3.25 3.333-3.25h3.334c1.84 0 3.333 1.456 3.333 3.25v.683A7.966 7.966 0 0 1 12 20ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10c0 5.5-4.44 9.963-9.932 10h-.138C6.438 21.962 2 17.5 2 12Zm10-5c-1.84 0-3.333 1.455-3.333 3.25S10.159 13.5 12 13.5c1.84 0 3.333-1.455 3.333-3.25S13.841 7 12 7Z' clipRule='evenodd' />
                    </svg>
                    )
            }
      </div>
      <div style={{
        width: 800,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}
      >
        <div style={{
          display: 'flex',
          paddingBottom: 8
        }}
        >
          <h1 style={{
            fontWeight: 700,
            fontFamily: 'noto-semibold',
            color: '#e5e7eb',
            fontSize: titleFontSize,
            lineHeight: 1
          }}
          >
            {title}
          </h1>
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 8
        }}
        >
          <p style={{
            fontWeight: 400,
            color: '#9ca3af',
            fontSize: handleFontSize,
            lineHeight: 0.25
          }}
          >
            {displayName}
          </p>
          <p style={{
            fontWeight: 400,
            color: '#9ca3af',
            fontSize: handleFontSize,
            lineHeight: 0.25
          }}
          >
            {handle}
          </p>
        </div>
      </div>
      <div style={{
        width: 1200,
        paddingRight: 16,
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        color: '#e5e7eb',
        fontSize: '2rem',
        fontWeight: 700,
        fontFamily: 'noto-semibold',
        gap: 10
      }}
      >
        <img
          src={`${prefix}/whtwnd.svg`}
          style={{
            width: '4%'
          }}
        />
        <p style={{

        }}
        >WhiteWind
        </p>
      </div>
    </div>
  )
}
