'use client'
import { type FC, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next-nprogress-bar'
import { Dropdown, Navbar } from 'flowbite-react'
import { AppBskyActorDefs, BskyAgent } from '@atproto/api'
// import { LoginModal } from '@/components/LoginModal'
import { LogoutModal } from '@/components/LogoutModal'
import SimpleAvatar from '@/components/SimpleAvatar'
import { HeaderContext } from '@/contexts/HeaderContext'
import HeaderIcon from '@/../public/whtwnd.svg'
import dynamic from 'next/dynamic'
import { useAtomValue, useSetAtom } from 'jotai'
import { ProfileViewDetailed } from '@atproto/api/dist/client/types/app/bsky/actor/defs'
import { GetIdentityResult, getSessionAtom, identitiesAtom, signInAtom, setLastSelectedSeenUsersAtom } from '@/atoms'

const LoginModal = dynamic(async () => await import('../LoginModal'), { ssr: false })

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
  const [loginModalState, setLoginModalState] = useState<{ open: boolean, redirectUri?: string }>({ open: false })
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const login = useSetAtom(signInAtom)
  const { setCurProfile, setRequestAuth } = useContext(HeaderContext)
  const router = useRouter()

  const identities = useAtomValue(identitiesAtom)
  const setLastSelected = useSetAtom(setLastSelectedSeenUsersAtom)
  const getSession = useSetAtom(getSessionAtom)

  const [collapseOpen, setCollapseOpen] = useState(false)
  const collapseOpenRef = useRef(false)

  const prevScrollPos = useRef(0)
  const [visible, setVisible] = useState(true)
  async function checkSessionValidity (profile: ProfileViewDetailed, redirect?: string): Promise<void> {
    const sess = await getSession(profile.did)
    if (sess === undefined) {
      await login({ ident: profile.handle, redirect })
    }
  }

  const handleScroll = useCallback(() => {
    const currentScrollPos = window.scrollY

    if (currentScrollPos > prevScrollPos.current && !collapseOpenRef.current) {
      setVisible(false)
    } else {
      setVisible(true)
    }

    prevScrollPos.current = currentScrollPos
  }, [])

  const onRequestAuth = useCallback((redirectUri?: string) => {
    setLoginModalState({ open: true, redirectUri })
  }, [])

  const onPostNewEntryClick = useCallback(() => {
    const path = `/${profiles[selected]?.handle}/edit`
    if (profiles[selected] !== undefined) {
      router.push(path)
      return
    }
    setLoginModalState({ open: true })
  }, [profiles, router, selected])

  const onLoginModalClose = (identity?: string): void => {
    if (identity === undefined || identity.length === 0) {
      setLoginModalState({ open: false })
      return
    }
    setLoginModalState({ open: false })
    void loadProfiles()
  }

  const onLogoutModalClose = (): void => {
    setIsLogoutModalOpen(false)
    void loadProfiles()
  }

  const loadProfiles = useCallback(async () => {
    setLoading(true)
    const ids = JSON.parse(JSON.stringify(identities)) as GetIdentityResult[]
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
  }, [identities, setCurProfile])

  const handleProfileSelect = useCallback((profile: ProfileViewDetailed, i: number) => {
    setSelected(i)
    setCurProfile(profiles[i])
    setLastSelected({ lastSelected: new Date().toISOString(), did: profile.did })
    // try to get session. if no session is available, automatically navigate to login
    void checkSessionValidity(profile)
  }, [checkSessionValidity, setLastSelected])

  const handleViewMyEntries = useCallback((profile: ProfileViewDetailed) => {
    const path = `/${profile.handle}`
    // if session is expired, navigate to login page
    void checkSessionValidity(profile, path)
    // session is valid
    router.push(path)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    setRequestAuth(() => (redirectUri?: string) => {
      onRequestAuth(redirectUri)
    })

    void loadProfiles()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, loadProfiles, onRequestAuth, setRequestAuth])

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
                key={profile.did} autoFocus={i === selected} disabled={disableSwitchAccount === true && i !== selected} onClick={() => handleProfileSelect(profile, i)}
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
                        profiles[selected] !== undefined &&
                          <Dropdown.Item onClick={() => handleViewMyEntries(profiles[selected])}>
                            View my entries
                          </Dropdown.Item>
          }
          <Dropdown.Item className='font-semibold text-sky-400 stroke-sky-400 transition duration-200 focus:bg-sky-400 hover:bg-sky-400 hover:text-gray-100 hover:stroke-gray-100 focus:text-gray-100 gap-1' onClick={onPostNewEntryClick}>
            Post new entry
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => setLoginModalState({ open: true })}>
            {`Sign in with ${profiles[selected] !== undefined ? 'another ' : ''}Bluesky account`}
          </Dropdown.Item>
          {profiles[selected] !== undefined && <Dropdown.Item onClick={() => setIsLogoutModalOpen(true)}>Sign out</Dropdown.Item>}
          <Dropdown.Divider />
          <a href='https://bsky.app' target='_blank' rel='noreferrer'>
            <Dropdown.Item>Sign up (opens Bluesky)</Dropdown.Item>
          </a>
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
      <LoginModal open={loginModalState.open} onClose={onLoginModalClose} signInRedirect={loginModalState.redirectUri} />
      {
                profiles[selected] !== undefined && <LogoutModal
                  identity={profiles[selected].did}
                  open={isLogoutModalOpen}
                  onClose={onLogoutModalClose}
                                                    />
            }
    </Navbar>
  )
}

export default Header
