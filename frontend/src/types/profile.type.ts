export interface Profile {
    name: string;
    avatar: string;
    phone_number?: string;
    address?: object[];
    birthday?: string;
    gender?: string;
}

export interface ProfileResponse {
    profile: Profile;
}
