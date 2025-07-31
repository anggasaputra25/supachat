'use client'

import Swal from 'sweetalert2'
import { supabase } from '@/lib/supabaseClient'
import { FaPlus } from "react-icons/fa";

const CardAddContact = () => {
  const handleAddContact = async () => {
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (!user || authError) {
      return Swal.fire({
        icon: 'error',
        title: 'Not logged in',
        text: 'You must be logged in to add contacts.',
        background: '#171717',
        color: '#fff'
      })
    }

    const { value: username } = await Swal.fire({
      title: 'Add New Friend',
      input: 'text',
      inputLabel: 'Enter their username',
      inputPlaceholder: 'e.g., johndoe123',
      showCancelButton: true,
      confirmButtonText: 'Add',
      confirmButtonColor: '#5d0ec0',
      background: '#171717',
      color: '#fff',
      inputAttributes: {
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    })

    if (!username) return

    const { data: userToAdd, error: findError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (findError || !userToAdd) {
      return Swal.fire({
        icon: 'error',
        title: 'User not found',
        text: `No user with username "${username}"`,
        background: '#171717',
        color: '#fff'
      })
    }

    if (userToAdd.id === user.id) {
      return Swal.fire({
        icon: 'warning',
        title: 'Cannot add yourself',
        text: 'You cannot add your own username as a contact.',
        background: '#171717',
        color: '#fff'
      })
    }

    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id: user.id,
        contact_id: userToAdd.id
      })

    if (insertError) {
      return Swal.fire({
        icon: 'error',
        title: 'Already added?',
        text: 'You may have already added this user.',
        background: '#171717',
        color: '#fff'
      })
    }

    Swal.fire({
      icon: 'success',
      title: 'Contact added!',
      text: `You added @${username} to your contacts.`,
      background: '#171717',
      color: '#fff'
    }).then(() => {
      location.reload();
    });
  }

  return (
    <button onClick={handleAddContact} className="py-2 md:p-3 w-full md:w-1/2 lg:w-1/3 cursor-pointer">
      <div className="bg-neutral-900 p-3 rounded-sm flex gap-4">
        <div className="w-25 h-20 bg-white text-black rounded-sm flex justify-center items-center text-3xl"><FaPlus /></div>
        <div className="flex flex-col justify-center w-full items-baseline">
          <h2 className="text-2xl font-bold">Add New Friend</h2>
          <p className="font-medium text-neutral-400">Ask their username!</p>
        </div>
      </div>
    </button>
  )
}

export default CardAddContact