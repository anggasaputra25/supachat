'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { TProfile } from '@/types/profile'
import ComponentCardContact from '@/components/CardContact'
import ComponentNavbar from '@/components/Navbar'
import { ComponentNavbarSkeleton } from '@/components/NavbarSkeleton'
import CardAddContact from '@/components/CardAddContact'
import CardContactSkeleton from '@/components/CardContactSkeleton'
import { useChats } from '@/hooks/useChats'

const Contacts = () => {
  const { profile, loading } = useChats();
  const router = useRouter()
  const [loadingContacts, setLoadingContacts] = useState(true)
  // const [profile, setProfile] = useState<TProfile | null>(null)
  const [myContacts, setMyContacts] = useState<TProfile[]>([])

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

      // Fetch contacts (with join to get contact profile info)
      const { data: contactList, error: contactsError } = await supabase
        .from('contacts')
        .select('contact:contact_id(*)') // join with profiles table
        .eq('user_id', userId)

      if (contactsError) {
        console.error('Failed to load contacts', contactsError)
      } else {
        const contactProfiles = contactList.map((item) => item.contact).flat()
        setMyContacts(contactProfiles)
      }

      setLoadingContacts(false)
    }

    checkUser()
  }, [router])

  return (
    <div>
      {loading || loadingContacts ? (
        <ComponentNavbarSkeleton />
      ) : (
        <ComponentNavbar profile={profile} inPage={1} />
      )}

      <div className="flex p-5 flex-wrap">
        {loading || loadingContacts ? (
          <>
            <CardContactSkeleton />
            <CardContactSkeleton />
            <CardContactSkeleton />
          </>
        ) : (
          myContacts
            .map((contact) => (
              <ComponentCardContact key={contact.id} profile={contact} isContact={true} />
            ))
        )}
        {loading || loadingContacts ? (
          <></>
        ) : (
          <CardAddContact />
        )}
      </div>
    </div>
  )
}

export default Contacts;