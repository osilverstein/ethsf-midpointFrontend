import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3 from 'web3'
import { useEffect, useState } from 'react'
import detectEthereumProvider from '@metamask/detect-provider';
import { Loader, Input, Button, Icon, Placeholder, Card, Header } from 'semantic-ui-react'
import axios from 'axios'

export default function Home() {
  // call smart contract
  const abi = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "article",
          "type": "string"
        }
      ],
      "name": "callMidpoint",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "requestId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "user",
          "type": "string"
        }
      ],
      "name": "ResponseReceived",
      "type": "event"
    }
  ]
  const address = '0xd182C5BaD241be139128a12853Af857aB450df2F'
  //need to get input from user and pass it to the smart contract
  const [input, setInput] = useState('')
  const [web3, setWeb3] = useState(null)
  const [account, setAccount] = useState(null)
  const [contract, setContract] = useState(null)
  const [result, setResult] = useState(null)
  const [hash, setHash] = useState(null)
  const [profilePic, setProfilePic] = useState(null)

  // initialize web3
  useEffect(() => {
    async function initWeb3() {
      // Modern dapp browsers...
      if (window.ethereum) {
        const provider = window.ethereum;
        const web3 = new Web3(provider)
        await provider.request({ method: 'eth_requestAccounts' })
        const accounts = await web3.eth.getAccounts()
        const contract = new web3.eth.Contract(abi, address)
        setWeb3(web3)
      }
    }
    initWeb3()
  }, [])

  // get account
  useEffect(() => {
    async function getAccount() {
      if (web3) {
        const accounts = await web3.eth.getAccounts()
        setAccount(accounts[0])
      }
    }
    getAccount()
  }, [web3])

  // get contract
  useEffect(() => {
    async function getContract() {
      if (web3) {
        const contract = new web3.eth.Contract(abi, address)
        setContract(contract)
      }
    }
    getContract()
  }, [web3])

  // profile pic from twitter
  useEffect(() => {
    async function getProfilePic() {
      if (result) {
        //curl "https://api.twitter.com/2/users/by/username/$USERNAME" -H "Authorization: Bearer $ACCESS_TOKEN"
        //user object endpoint

        axios({
          method: 'get',
          url: `https://api.twitter.com/2/users/by/username/${result}`,
          responseType: 'stream',
          headers: {
            'Authorization': `Bearer AAAAAAAAAAAAAAAAAAAAAG0AjAEAAAAApTl7Ph9WXnjAyKK4syafrdeTnYY%3DaLunad4Ij5SdIv1tkJmvHMC2Z5PzWLlCUn4rNVDy0cS1we8aGn`
          },
          params: {
            'user.fields': 'profile_image_url',
            'expansions': 'pinned_tweet_id',
          }
        })
          .then(async (response) => {
            let res = JSON.parse(response.data);
            console.log(res.data.profile_image_url);
            setProfilePic(res.data.profile_image_url);
          });
      }
    }
    getProfilePic()
  }, [result])

  // call smart contract
  const callContract = async () => {
    console.log('metaMask account', account)
    console.log('input', input)
    setResult('loading');
    setHash('loading');
    const result = await contract.methods.callMidpoint(input).send({ from: account, gas: 10000000 })
    contract.events.ResponseReceived({})
      .on('data', event => {
        const user = event.returnValues.user;
        const transactionHash = event.transactionHash;
        setResult(user);
        setHash(transactionHash);
      })
      .on('error', err => {
        setResult(<p style={{ color: 'red' }}>{'error ' + JSON.stringify(err)}</p>)
      })
  }

  // get input from user
  const handleInput = (e) => {
    setInput(e.target.value)
  }

  // on click, call smart contract
  const handleClick = () => {
    callContract()
  }

  return (
    // center div eq
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Dividing text */}
      <div style={{ width: '50%', marginTop: '1%', textAlign: 'center', marginBottom: '1%' }}>
        <Header as='h2' dividing>
          Attest from Chain
        </Header>
      </div>
      <Card centered style={{ width: '50%', marginTop: '1%' }}>
        <Card.Content>
          <Card.Header>Check Proofs For Address</Card.Header>
        </Card.Content>
        <Card.Content>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Input
              placeholder='0xbEA57b7b7fbF93a2f2Aa0C16D68f9789B0b9A05e'
              onChange={handleInput}
              style={{ width: '100%' }}
            />
            <Button
              icon
              labelPosition='right'
              onClick={handleClick}
              style={{ width: '20%', marginTop: '10px', alignSelf: 'flex-start' }}
            >
              Verify
              {/* shield icon */}
              <Icon name='shield' />
            </Button>
          </div>

        </Card.Content>
      </Card>

      {/* Dividing text */}
      <div style={{ width: '50%', marginTop: '1%', textAlign: 'center', marginBottom: '1%' }}>
        <Header as='h2' dividing>
          Proofs
        </Header>
      </div>

      {/* Card for twitter proof */}
      <Card centered style={{ width: '50%', marginTop: '1%' }}>
        <Card.Content>
          <Card.Header>Twitter Proof</Card.Header>
        </Card.Content>
        <Card.Content>
          {/* circular profile picture on left with username,hash in middle, and verified checkmark on right */}
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <div style={{ width: '100%', textAlign: 'center' }}>{result === 'loading' ? <Placeholder><Placeholder.Image /></Placeholder> : result === null ? <Placeholder><Placeholder.Image /></Placeholder> : <Image
              src={profilePic}
              width={50}
              height={50}
              style={{ borderRadius: '50%' }} />}</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', marginLeft: '20px' }}>
              <div style={{ width: '100%'}}>{result === 'loading' ? <Placeholder><Placeholder.Line /></Placeholder> : result === null ? <Placeholder><Placeholder.Line /></Placeholder> : <h4>@{result}</h4>}</div>
              {/* grey underline text for hash */}
              <div style={{ width: '100%', color: 'grey'}}>{hash === 'loading' ? <Placeholder><Placeholder.Line /></Placeholder> : hash === null ? <Placeholder><Placeholder.Line /></Placeholder> : <p>{hash}</p>}</div>
            </div>
            {/* show check icon if verified, otherwise show nothing */}
            <div style={{ width: '100%', textAlign: 'center' }}>{result === 'loading' ? '' : result === null ? '' : <Icon name='check' color='blue' />}</div>
          </div>
        </Card.Content>
      </Card>

      {/* {hash === 'loading' ? <Placeholder><Placeholder.Line /></Placeholder> : hash === null ? <p>pending contract call</p> : <p>{hash}</p>}
      {result === 'loading' ? <Placeholder><Placeholder.Line /></Placeholder> : result === null ? <p>pending contract call</p> : <p>{result}</p>} */}

    </div>
  )
}