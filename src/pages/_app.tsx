import NextApp from 'next/app';
import '../styles/globals.scss'

class App extends NextApp {
  render() {
    const { Component, pageProps } = this.props

    return (
      <Component {...pageProps} />
    )
  }
}

export default App
