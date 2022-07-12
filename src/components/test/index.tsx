import React from 'react'

type TestProps = {
  tag: string
}

const Test: React.FC<TestProps> = ({tag}) => (
  <div>
    <h1>Test:</h1>
    <span>tag:{tag}</span>
  </div>
)

export default Test
