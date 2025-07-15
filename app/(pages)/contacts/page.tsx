'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { TProfile } from '@/app/types/profile'
import ComponentCardContact from '@/app/components/CardContact'
import ComponentNavbar from '@/app/components/Navbar'
import { ComponentNavbarSkeleton } from '@/app/components/NavbarSkeleton'
import CardAddContact from '@/app/components/CardAddContact'
import CardContactSkeleton from '@/app/components/CardContactSkeleton'

const Contacts = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<TProfile | null>(null)
  const [contacts, setContacts] = useState<TProfile[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      if (!session || sessionError) {
        router.push('/sign-in')
        return
      }

      const userId = session.user.id

      // Fetch profile (with cache check)
      const storedProfile = sessionStorage.getItem('profile')
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile))
      } else {
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (userProfile) {
          setProfile(userProfile)
          sessionStorage.setItem('profile', JSON.stringify(userProfile))
        } else {
          console.error('Failed to fetch profile', profileError)
        }
      }

      // Fetch contacts (with join to get contact profile info)
      const { data: contactList, error: contactsError } = await supabase
        .from('contacts')
        .select('contact:contact_id(*)') // join with profiles table
        .eq('user_id', userId)

      if (contactsError) {
        console.error('Failed to load contacts', contactsError)
      } else {
        const contactProfiles = contactList.map((item) => item.contact).flat()
        setContacts(contactProfiles)
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  return (
    <div>
      {loading ? (
        <ComponentNavbarSkeleton />
      ) : (
        <ComponentNavbar profile={profile} inPage={1}/>
      )}

      <div className="flex p-5 flex-wrap">
        {loading ? (
          <>
            <CardContactSkeleton />
            <CardContactSkeleton />
            <CardContactSkeleton />
          </>
        ) : (
          contacts.map((contact) => (
            <ComponentCardContact key={contact.id} profile={contact} />
          ))
        )}
        {loading ? (
          <></>
        ) : (
          <CardAddContact />
        )}
      </div>
    </div>
  )
}

export default Contacts;