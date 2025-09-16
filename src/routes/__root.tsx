/// <reference types="vite/client" />

import { Outlet,Link, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanstackDevtools } from '@tanstack/react-devtools'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  component: () => (
    <>
      <div className='min-h-screen bg-white font-poppins'>
        {/* Navigation Header */}
        <nav className='bg-white shadow-sm border-b border-gray-100 px-6 py-4'>
          <div className='max-w-7xl mx-auto flex items-center justify-between'>
            <div className='flex items-center space-x-8'>
              <h1 className='text-2xl font-bold text-gray-900 font-poppins'>
                SISTER Dashboard
              </h1>
              <div className='flex space-x-6'>
                <Link
                  to='/dashboard'
                  className='px-4 py-2 rounded-lg text-gray-600 hover:text-primary-pink hover:bg-primary-pink/10 font-medium transition-all duration-200 font-poppins hover:scale-105 hover:shadow-sm'
                  activeProps={{
                    className:
                      'text-primary-pink font-semibold bg-primary-pink/15 shadow-sm',
                  }}
                >
                  Dashboard
                </Link>
                <Link
                  to='/dashboard/tugas'
                  className='px-4 py-2 rounded-lg text-gray-600 hover:text-primary-pink hover:bg-primary-pink/10 font-medium transition-all duration-200 font-poppins hover:scale-105 hover:shadow-sm'
                  activeProps={{
                    className:
                      'text-primary-pink font-semibold bg-primary-pink/15 shadow-sm',
                  }}
                >
                  Pengumpulan Tugas
                </Link>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='text-sm text-gray-600 font-poppins'>
                Selamat datang,{' '}
                <span className='font-semibold text-primary-pink'>
                  Mahasiswa
                </span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className='max-w-7xl mx-auto px-6 py-8 bg-white'>
          <Outlet />
                             <TanstackDevtools
              config={{
                position: 'bottom-left',
              }}
              plugins={[
                {
                  name: 'Tanstack Router',
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />

        </main>
      </div>
    </>
  ),
})
