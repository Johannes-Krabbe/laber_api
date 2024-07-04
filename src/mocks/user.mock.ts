import { appMock } from "./app.mock";

export async function createFakeUser() {
    const userdata = {
        username: "testusername",
        password: "testpassword",
    }
    const res = await appMock.post('/auth/register', {
        body: userdata,
    })
    return { ...userdata, token: res.body.token }
}
