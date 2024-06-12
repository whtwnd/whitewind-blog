'use client'
import { ListHeroSection } from '@/components/ListHeroSection'
import { AuthorInfoContext, IAuthorInfoContextValue } from '@/contexts/AuthorInfoContext'
import { Card } from 'flowbite-react'
import { FC, useContext } from 'react'

export interface IBottomAuthorCardProps {
  authorInfo?: IAuthorInfoContextValue
}

export const BottomAuthorCard: FC<IBottomAuthorCardProps> = ({ authorInfo }) => {
  const contextValue = useContext(AuthorInfoContext)
  return <Card><ListHeroSection authorInfo={authorInfo ?? contextValue} maxlines={100} whtwndLink /></Card>
}
