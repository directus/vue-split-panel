import { mount } from '@vue/test-utils'
import { expect, test } from 'vitest'
import { HelloWorld } from '../src'

test('button', () => {
  const app = mount(HelloWorld);

  expect(app.text()).toMatchInlineSnapshot(`"Hello World"`)
  expect(app.html()).toMatchInlineSnapshot(`"<h1>Hello World</h1>"`)
})
