'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, Users, X, Check, AlertCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface UserData {
  id: string
  firstName?: string
  lastName?: string
  emailAddress: string
  role?: string
  isVerified?: boolean
  isAgency?: boolean
  isSuperAdmin?: boolean
}

interface ApiResponse {
  success: boolean
  users: UserData[]
  total: number
  currentUserRole: string
  currentUserLevel: number
}

export default function DeveloperRoleChanger() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(false)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<string>('user')
  const [currentUserLevel, setCurrentUserLevel] = useState<number>(0)
  
  // Show to all authenticated users for development purposes
  if (!user) {
    return null
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data: ApiResponse = await response.json()
        setUsers(data.users || [])
        setCurrentUserRole(data.currentUserRole || 'user')
        setCurrentUserLevel(data.currentUserLevel || 0)
      } else if (response.status === 403) {
        showMessage('error', 'Insufficient permissions to view user list')
      } else {
        showMessage('error', 'Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      showMessage('error', 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'agent' | 'agency' | 'supplier' | 'superadmin') => {
    setUpdateLoading(userId)
    try {
      const response = await fetch('/api/admin/update-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, role: newRole })
      })

      if (response.ok) {
        showMessage('success', `Role updated to ${newRole}`)
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, role: newRole } : u
          )
        )
      } else {
        const data = await response.json()
        if (response.status === 403) {
          showMessage('error', data.error || 'Insufficient permissions')
        } else {
          showMessage('error', data.error || 'Failed to update role')
        }
      }
    } catch (error) {
      console.error('Error updating role:', error)
      showMessage('error', 'Failed to update role')
    } finally {
      setUpdateLoading(null)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 3000)
  }

  // Role hierarchy for UI logic
  const roleHierarchy = {
    user: 0,
    agent: 1,
    agency: 2,
    supplier: 2,
    superadmin: 3
  }

  // Show all roles for development/testing purposes
  // In production, you might want to implement proper role-based restrictions
  const availableRoles = ['user', 'agent', 'agency', 'supplier', 'superadmin']

  const handleToggle = () => {
    if (!isOpen) {
      setIsOpen(true)
      fetchUsers()
    } else {
      setIsOpen(false)
      setIsExpanded(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Message Toast */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute bottom-20 right-0 px-4 py-2 rounded-lg shadow-lg text-white text-sm font-medium ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
            style={{ width: isExpanded ? '400px' : '300px', maxHeight: '500px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users size={20} />
                  <h3 className="font-semibold">Role Manager</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {currentUserRole}
                  </span>
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white/80 hover:text-white text-sm"
                  >
                    {isExpanded ? 'Collapse' : 'Expand'}
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading users...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No users found</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {users.map((userData) => (
                    <div key={userData.id} className="p-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {userData.firstName} {userData.lastName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {userData.emailAddress}
                            </p>
                          </div>
                          {userData.isVerified && (
                            <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Verified
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <span className="text-sm text-gray-600">
                            Current: <span className="font-medium capitalize">{userData.role || 'user'}</span>
                          </span>
                          
                          <div className="grid grid-cols-3 gap-1">
                            {availableRoles.includes('user') && (
                              <button
                                onClick={() => updateUserRole(userData.id, 'user')}
                                disabled={updateLoading === userData.id || userData.role === 'user'}
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                                  userData.role === 'user'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800'
                                } disabled:opacity-50`}
                              >
                                {updateLoading === userData.id ? (
                                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  'User'
                                )}
                              </button>
                            )}
                            
                            {availableRoles.includes('agent') && (
                              <button
                                onClick={() => updateUserRole(userData.id, 'agent')}
                                disabled={updateLoading === userData.id || userData.role === 'agent'}
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                                  userData.role === 'agent'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-800'
                                } disabled:opacity-50`}
                              >
                                {updateLoading === userData.id ? (
                                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  'Agent'
                                )}
                              </button>
                            )}
                            
                            {availableRoles.includes('agency') && (
                              <button
                                onClick={() => updateUserRole(userData.id, 'agency')}
                                disabled={updateLoading === userData.id || userData.role === 'agency'}
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                                  userData.role === 'agency'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                                } disabled:opacity-50`}
                              >
                                {updateLoading === userData.id ? (
                                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  'Agency'
                                )}
                              </button>
                            )}
                            
                            {availableRoles.includes('supplier') && (
                              <button
                                onClick={() => updateUserRole(userData.id, 'supplier')}
                                disabled={updateLoading === userData.id || userData.role === 'supplier'}
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                                  userData.role === 'supplier'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-800'
                                } disabled:opacity-50`}
                              >
                                {updateLoading === userData.id ? (
                                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  'Supplier'
                                )}
                              </button>
                            )}
                            
                            {availableRoles.includes('superadmin') && (
                              <button
                                onClick={() => updateUserRole(userData.id, 'superadmin')}
                                disabled={updateLoading === userData.id || userData.role === 'superadmin'}
                                className={`px-2 py-1 text-xs rounded-full font-medium transition-colors ${
                                  userData.role === 'superadmin'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-800'
                                } disabled:opacity-50`}
                              >
                                {updateLoading === userData.id ? (
                                  <div className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  'Super Admin'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="w-14 h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        title={`Role Manager - Current: ${currentUserRole}`}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? <X size={24} /> : <Settings size={24} />}
        </motion.div>
        
        {/* Pulse animation for better visibility */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-0 group-hover:opacity-30"
          animate={isOpen ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  )
}