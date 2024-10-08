import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { ENV } from '../env'

export const sendSMS = async ({
    phoneNumber,
    message,
}: {
    phoneNumber: string
    message: string
}) => {
    if (ENV.NODE_ENV === 'test') {
        return
    } else if (ENV.SEND_SMS) {
        const client = new SNSClient({
            region: ENV.AWS_REGION,
            credentials: {
                accessKeyId: ENV.AWS_ACCESS_KEY_ID!,
                secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY!,
            },
        })

        return await client.send(
            new PublishCommand({
                Message: message,
                PhoneNumber: phoneNumber,
                Subject: 'Laber APP',
            })
        )
    } else {
        console.log('SMS not sent, ENV.SEND_SMS is false.')
        console.log({ phoneNumber, message })
    }
}
