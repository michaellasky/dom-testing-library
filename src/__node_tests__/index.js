import {JSDOM} from 'jsdom'
import * as dtl from '../'

test('works without a global dom', async () => {
  const container = new JSDOM(`
    <html>
      <body>
        <form id="login-form">
          <label for="username">Username</label>
          <input id="username" />
          <label for="password">Password</label>
          <input id="password" type="password" />
          <button type="submit">Submit</button>
          <div id="data-container"></div>
        </form>
      </body>
    </html>
  `).window.document.body
  container.querySelector('#login-form').addEventListener('submit', e => {
    e.preventDefault()
    const {username, password} = e.target.elements
    setTimeout(() => {
      const dataContainer = container.querySelector('#data-container')
      const pre = container.ownerDocument.createElement('pre')
      pre.dataset.testid = 'submitted-data'
      pre.textContent = JSON.stringify({
        username: username.value,
        password: password.value,
      })
      dataContainer.appendChild(pre)
    }, 20)
  })

  const fakeUser = {username: 'chucknorris', password: 'i need no password'}
  const usernameField = dtl.getByLabelText(container, /username/i)
  const passwordField = dtl.getByLabelText(container, /password/i)
  usernameField.value = fakeUser.username
  passwordField.value = fakeUser.password
  const submitButton = dtl.getByText(container, /submit/i)
  dtl.fireEvent.click(submitButton)
  const submittedDataPre = await dtl.findByTestId(
    container,
    'submitted-data',
    {},
    {container},
  )
  const data = JSON.parse(submittedDataPre.textContent)
  expect(data).toEqual(fakeUser)
})
