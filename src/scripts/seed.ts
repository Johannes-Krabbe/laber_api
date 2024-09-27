import { faker } from '@faker-js/faker'
import { loginUser, updateUser } from '../services/auth.service'
import { prisma } from '../../prisma/client'
import { Ed25519Key } from '../utils/curve/ed25519.util'
import { X25519Key } from '../utils/curve/x25519.util'
import { createDevice } from '../services/device.service'
import { uint8ArrayToString } from '../utils/curve/encode.util'

const userCount = 1

function generateMockPhoneNumber(): string {
    const countryCode = '49' // Germany's country code
    const areaCode = '17' + Math.floor(Math.random() * 10).toString()
    const subscriberNumber = Math.floor(Math.random() * 100000000)
        .toString()
        .padStart(8, '0')

    return `+${countryCode}${areaCode}${subscriberNumber}`
}

function generateMockProfilePictureUrl(): string {
    const randomNumber = Math.floor(Math.random() * 100)
    const randomBoolean = Math.random() >= 0.5
    const randomGender = randomBoolean ? 'men' : 'women'
    return `https://randomuser.me/api/portraits/med/${randomGender}/${randomNumber}.jpg`
}

function getKeyDataString(key: string): string {
    return JSON.stringify({
        type: 'x25519',
        publicKey: key,
    })
}

for (let i = 0; i < userCount; i++) {
    const phoneNumber = generateMockPhoneNumber()
    await loginUser({
        phoneNumber,
    })

    const user = await prisma.user.findFirst({
        where: {
            phoneNumber,
        },
    })

    if (!user) throw new Error('User not found')

    await updateUser(user.id, {
        name: faker.person.fullName(),
        username: faker.internet
            .userName()
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''),
    })

    await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            profilePicture: generateMockProfilePictureUrl(),
        },
    })

    const identityKeyPair = new Ed25519Key()

    const oneTimePreKeyPairs = await Promise.all(
        Array.from({ length: 5 }, async () => {
            return new X25519Key()
        })
    )

    const preKeyPair = new X25519Key()
    const signature = identityKeyPair.sign(preKeyPair.getPublicKey())

    const signatureStr = uint8ArrayToString(signature)

    console.log('identityKey')
    console.log(identityKeyPair.getPublicKey())
    console.log('signature')
    console.log(signature)

    console.log(user)
    const data = await createDevice({
        deviceName: faker.lorem.word(),
        identityKey: getKeyDataString(identityKeyPair.getPublicKeyString()),
        signedPreKey: {
            key: getKeyDataString(preKeyPair.getPublicKeyString()),
            signature: signatureStr,
        },
        oneTimePreKeys: oneTimePreKeyPairs.map((key) =>
            getKeyDataString(key.getPublicKeyString())
        ),

        user,
    })

    const mailbox = await prisma.mailbox.findUnique({
        where: {
            deviceId: data.device.id,
        },
        include: {
            device: true,
            messages: {
                include: {
                    senderDevice: true,
                },
            },
        },
    })

    console.log(mailbox)
}
