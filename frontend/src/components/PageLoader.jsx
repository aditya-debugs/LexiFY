import React from 'react'
import { LoaderIcon } from 'lucide-react'

const PageLoader = () => {
  return (
    <div className='h-screen flex items-center justify-center'>
        <LoaderIcon className='size-10 text-primary animate-spin' />
    </div>
  )
}

export default PageLoader