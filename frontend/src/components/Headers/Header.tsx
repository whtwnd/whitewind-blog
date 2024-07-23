'use client'
import { type FC, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { Dropdown, Navbar } from 'flowbite-react'
import { SessionContext } from '@/contexts/SessionContext'
import { AppBskyActorDefs, BskyAgent } from '@atproto/api'
import { LoginModal } from '@/components/LoginModal'
import { LogoutModal } from '@/components/LogoutModal'
import SimpleAvatar from '@/components/SimpleAvatar'
import { HeaderContext } from '@/contexts/HeaderContext'
import HeaderIcon from '@/../public/whtwnd.svg'

export interface IHeaderProps {
  title?: string
  children?: ReactNode
  mobileChildren?: ReactNode
  hidePostNewEntry?: boolean
  mainAreaClassName?: string
  disableSwitchAccount?: boolean
}

export const Header: FC<IHeaderProps> = ({ title, children, mobileChildren, hidePostNewEntry, mainAreaClassName, disableSwitchAccount }) => {
  const [selected, setSelected] = useState(0)
  const [profiles, setProfiles] = useState<AppBskyActorDefs.ProfileViewDetailed[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const [isNavigationScheduled, setIsNavigationScheduled] = useState(false)
  const manager = useContext(SessionContext)
  const { setCurProfile, setRequestAuth } = useContext(HeaderContext)
  const router = useRouter()

  const [collapseOpen, setCollapseOpen] = useState(false)
  const collapseOpenRef = useRef(false)

  const prevScrollPos = useRef(0)
  const [visible, setVisible] = useState(true)

  const isLoggedIn = profiles[selected] !== undefined;

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.scrollY

    if (currentScrollPos > prevScrollPos.current && !collapseOpenRef.current) {
      setVisible(false)
    } else {
      setVisible(true)
    }

    prevScrollPos.current = currentScrollPos
  }, [])

  const onRequestAuth = useCallback(() => {
    setIsLoginModalOpen(true)
  }, [])

  const onPostNewEntryClick = useCallback(() => {
    if (isLoggedIn) {
      router.push(`/${profiles[selected].handle}/edit`)
      return
    }
    setIsLoginModalOpen(true)
    setIsNavigationScheduled(true)
  }, [profiles, router, selected])

  const onLoginModalClose = (identity?: string): void => {
    if (identity === undefined || identity.length === 0) {
      setIsLoginModalOpen(false)
      return
    }
    setIsLoginModalOpen(false)
    if (isNavigationScheduled) {
      router.push(`/${identity}/edit`)
      return
    }
    void LoadProfiles()
  }

  const onLogoutModalClose = (): void => {
    setIsLogoutModalOpen(false)
    void LoadProfiles()
  }

  const LoadProfiles = useCallback(async () => {
    setLoading(true)
    const ids = await manager.getIdentities()
    if (ids.length === 0) {
      setLoading(false)
      setProfiles([])
      setSelected(0)
      setCurProfile(undefined)
      return
    }
    // get avatar
    const agent = new BskyAgent({
      service: 'https://public.api.bsky.app'
    })
    ids.sort((a, b) => {
      if (a.lastSelected === undefined || b.lastSelected === undefined) {
        return a.lastSelected !== undefined ? -1 : b.lastSelected !== undefined ? 1 : 0
      }
      return a.lastSelected > b.lastSelected ? -1 : a.lastSelected === b.lastSelected ? 0 : 1
    })
    const profiles = (await agent.getProfiles({ actors: ids.map(id => id.handle) })).data.profiles
    setProfiles(profiles)
    setLoading(false)
    setSelected(0)
    setCurProfile(profiles[0])
  }, [manager, setCurProfile])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    setRequestAuth(() => onRequestAuth)

    void LoadProfiles()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [manager, handleScroll, LoadProfiles, onRequestAuth, setRequestAuth])

  return (
    <Navbar fluid className={`bg-gray-100 border-b border-gray-400 text-gray-700 gap-6 sticky z-10 ${visible ? 'top-0' : ''}`}>
      {/* Site logo */}
      <Navbar.Brand href='/'>
        <div className='bg-sky-900 rounded-full'><HeaderIcon className='py-[5px] pl-[5px] pr-[3px] h-9' /></div>
        <span className='pl-1 self-center whitespace-nowrap text-xl transition duration-200 hover:text-gray-400 font-semibold text-gray-700'>{title ?? 'WhiteWind'}</span>
      </Navbar.Brand>
      {/* main area */}
      <div className='grow'>
        <div className={mainAreaClassName}>
          {children}
        </div>
      </div>
      {/* Right area */}
      <div className='flex gap-4'>
        {
                    hidePostNewEntry !== true &&
                      <button className='hidden md:flex py-2 pl-3 pr-4 flex flex-row items-center content-center gap-1 rounded-lg bg-sky-400 text-gray-100 stroke-gray-100 transition duration-200 hover:bg-sky-500 focus:ring-4 focus:ring-cyan-200' onClick={onPostNewEntryClick}>
                        <svg className='w-6 h-6 text-gray-800' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 12h14m-7 7V5' />
                        </svg>
                        <p className='block font-semibold text-sm'>Post new entry</p>
                      </button>
                }
        {/* Avatar menu */}
        <Dropdown
          arrowIcon={false}
          inline
          label={loading ? <div className='w-10 h-10 animate-pulse bg-gray-300 rounded-full' /> : <div className='w-10 h-10'><SimpleAvatar profile={profiles[selected]} handle={profiles[selected]?.handle ?? ''} /></div>}
        >
          {profiles.map((profile, i) => {
            const handle = `@${profile.handle}`
            const displayNameColor = disableSwitchAccount !== true || i === selected ? 'text-gray-700' : 'text-gray-500'
            const handleColor = disableSwitchAccount !== true || i === selected ? 'text-gray-500' : 'text-gray-300'
            return (
              <Dropdown.Item
                key={profile.did} autoFocus={i === selected} disabled={disableSwitchAccount === true && i !== selected} onClick={() => {
                  setSelected(i)
                  setCurProfile(profiles[i])
                  void manager.setLastSelected(new Date().toISOString(), profile.did)
                }}
              >
                <div className='flex flex-row items-center gap-4'>
                  <div className='w-10 h-10'><SimpleAvatar profile={profile} handle={profile.handle ?? ''} /></div>
                  <div className='space-y-1 font-medium text-left'>
                    <div className={`font-bold ${displayNameColor}`}>{profile.displayName ?? handle}</div>
                    <div className={`text-sm ${handleColor}`}>{profile.displayName !== undefined ? handle : ''}</div>
                  </div>
                </div>
              </Dropdown.Item>
            )
          })}
          <Dropdown.Divider />
          {
                        isLoggedIn &&
                          <a href={`/${profiles[selected].handle}`}>
                            <Dropdown.Item>
                              View my entries
                            </Dropdown.Item>
                          </a>
                    }
          <Dropdown.Item className='font-semibold text-sky-400 stroke-sky-400 transition duration-200 focus:bg-sky-400 hover:bg-sky-400 hover:text-gray-100 hover:stroke-gray-100 focus:text-gray-100 gap-1' onClick={onPostNewEntryClick}>
            Post new entry
          </Dropdown.Item>
          <Dropdown.Divider />
          {!isLoggedIn && <Dropdown.Item onClick={() => setIsLoginModalOpen(true)}>Sign in with Bluesky account</Dropdown.Item>}
          { isLoggedIn && <Dropdown.Item onClick={() => setIsLogoutModalOpen(true)}>Sign out</Dropdown.Item>}
          {!isLoggedIn && <Dropdown.Divider />}
          {!isLoggedIn && <a href='https://bsky.app' target='_blank' rel='noreferrer'>
            <Dropdown.Item>Sign up (opens Bluesky)</Dropdown.Item>
          </a>}
        </Dropdown>
        <Navbar.Toggle onClick={(e) => { e.preventDefault(); collapseOpenRef.current = !collapseOpen; setCollapseOpen(!collapseOpen) }} />
      </div>
      {/* Hidden menu on mobile */}
      <Navbar.Collapse className='md:hidden' theme={{ hidden: collapseOpen ? { on: 'on' } : { off: 'off' } }}>
        {mobileChildren ?? children}
        {
                    hidePostNewEntry !== true &&
                      <Navbar.Link>
                        <button className='flex flex-row items-center gap-1 font-semibold text-sky-400 stroke-sky-400' onClick={onPostNewEntryClick}>
                          <svg className='w-6 h-6 text-gray-800' aria-hidden='true' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 12h14m-7 7V5' />
                          </svg>
                          Post new entry
                        </button>
                      </Navbar.Link>
                }
      </Navbar.Collapse>
      <LoginModal open={isLoginModalOpen} onClose={onLoginModalClose} />
      {
                isLoggedIn && <LogoutModal
                  identity={profiles[selected].did}
                  open={isLogoutModalOpen}
                  onClose={onLogoutModalClose}
                                                    />
            }
    </Navbar>
  )
}

export default Header
