export interface UserUpdateResponseDto {
  name: string | null;
  scraperFrequency: number | null;
  discordId: string | null;
  discordActivationLink?: string | null;
}
