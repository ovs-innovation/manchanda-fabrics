import React from 'react'

const PageTitle = ({ children, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="admin-page-title">{children}</h1>
      {subtitle ? <p className="admin-muted mt-1">{subtitle}</p> : null}
    </div>
  )
}

export default PageTitle
