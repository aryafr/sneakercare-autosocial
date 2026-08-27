import React from "react";
import { SettingsClient } from "./SettingsClient";
import { getSocialAccounts, getSocialTemplates } from "@/actions/settings";

export const revalidate = 0;

export default async function SettingsPage() {
  const [{ data: accounts = [] }, { data: templates = [] }] = await Promise.all([
    getSocialAccounts(),
    getSocialTemplates(),
  ]);

  return (
    <SettingsClient
      initialAccounts={accounts}
      initialTemplates={templates}
    />
  );
}
