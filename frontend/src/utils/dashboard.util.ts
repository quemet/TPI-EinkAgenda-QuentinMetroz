export const askForAgendaName = (agenda: { id: string; name: string }) => {
  const name = prompt("Entrez le nom de l'agenda :", agenda.name)
  if (name) {
    return name
  }
  return agenda.name
}

export const askConfirmationForTheChangmentOfRole = (role: string) => {
  if (role === 'user') {
    return confirm(
      "Êtes-vous sûr de vouloir donner les droits d'administrateur à cet utilisateur ?",
    )
  }
  return alert('Cette personne est déjà un administrateur.')
}

export const askUserConfirmation = () => {
  return confirm('Êtes-vous sûr de vouloir enlever cet utilisateur de la famille ?')
}

export const copyLink = async (linkCopied: { value: boolean }, familyId: string) => {
  await navigator.clipboard.writeText(createAddMemberLink(familyId))
  linkCopied.value = true
  setTimeout(() => (linkCopied.value = false), 2000)
}

export const createAddMemberLink = (familyId: string) => {
  return `http://localhost:5173/login?familyId=${familyId}`
}
