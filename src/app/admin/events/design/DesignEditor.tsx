'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { randomPalette } from '@/lib/palette'
import { FONT_SLOTS, fontKeyOf, type FontSlot } from '@/templates/font-options'
import {
  applyOverrides,
  COLOR_KEYS,
  type ColorKey,
  type ThemeOverrides,
} from '@/templates/overrides'
import { themeToCssVariables } from '@/templates/registry'
import type { Theme } from '@/templates/types'
import { ShuffleIcon, Undo2Icon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { type ReactNode, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

import { saveEventDesign } from '../design-actions'
import { PreviewPane } from '../sections-editor/PreviewPane'

import { ArtImageField } from './ArtImageField'
import { ColorField } from './ColorField'
import { FontField } from './FontField'
import { COLOR_LABELS, contrastWarnings } from './labels'
import { MotionField } from './MotionField'

type EnvelopeChanges = NonNullable<ThemeOverrides['envelope']>

/**
 * First `url('…')` of a CSS background, to preview a template picture.
 *
 * @param css - CSS `background` value.
 */
function urlIn(css: string): string | undefined {
  return /url\('([^']+)'\)/.exec(css)?.[1]
}

interface DesignEditorProps {
  eventId: string
  templateName: string
  baseTheme: Theme
  initial: ThemeOverrides
}

/**
 * "Diseño" tab: the event's own colors, fonts and pictures on top of its
 * template. Shows readability warnings live; saved changes reload the
 * preview (with the envelope).
 *
 * @param props - Component props.
 * @param props.baseTheme - Template theme.
 * @param props.eventId - Event id.
 * @param props.initial - Saved changes.
 * @param props.templateName - Template name.
 */
export function DesignEditor({
  baseTheme,
  eventId,
  initial,
  templateName,
}: DesignEditorProps): ReactNode {
  const router = useRouter()
  const [saved, setSaved] = useState(initial)
  const [draft, setDraft] = useState(initial)
  const [version, setVersion] = useState(0)
  const [saving, startSaving] = useTransition()
  // Colors before each shuffle, so "Anterior" can step back.
  const [colorHistory, setColorHistory] = useState<ThemeOverrides['colors'][]>(
    []
  )

  const theme = applyOverrides(baseTheme, draft)
  // Same variables the invitation renders with, sent live to the preview.
  const liveTheme = useMemo(
    () => themeToCssVariables(theme) as Record<string, string>,
    // `theme` is rebuilt every render; the draft is what changes it.
    // oxlint-disable-next-line react/exhaustive-deps
    [draft, baseTheme]
  )
  const changedColors = new Set(
    COLOR_KEYS.filter((key) => Boolean(draft.colors?.[key]))
  )
  const warnings = contrastWarnings(theme.colors, changedColors)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const warningCount = Object.values(warnings).flat().length

  /**
   * Sets or clears one color.
   *
   * @param key - Color slot.
   * @param hex - New color, `undefined` = template's.
   */
  function setColor(key: ColorKey, hex: string | undefined): void {
    setDraft((current) => ({
      ...current,
      colors: { ...current.colors, [key]: hex },
    }))
  }

  /**
   * Sets or clears one envelope value.
   *
   * @param key - Envelope field.
   * @param value - New value, `undefined` = template's.
   */
  function setEnvelope<K extends keyof EnvelopeChanges>(
    key: K,
    value: EnvelopeChanges[K]
  ): void {
    setDraft((current) => ({
      ...current,
      envelope: { ...current.envelope, [key]: value },
    }))
  }

  /** Replaces every color with a random palette that reads well. */
  function shuffleColors(): void {
    setColorHistory((history) => [...history.slice(-19), draft.colors])
    setDraft((current) => ({ ...current, colors: randomPalette() }))
  }

  /** Restores the colors from before the last shuffle. */
  function previousColors(): void {
    const previous = colorHistory.at(-1)
    setColorHistory((history) => history.slice(0, -1))
    setDraft((current) => ({ ...current, colors: previous }))
  }

  /** Saves the draft and reloads the preview. */
  function save(): void {
    startSaving(async () => {
      const result = await saveEventDesign(eventId, draft)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setSaved(draft)
      // Live updates already show the draft; reload only for the monogram,
      // texts and anything rendered on the server.
      setVersion((value) => value + 1)
      toast.success('Diseño guardado')
      router.refresh()
    })
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_auto]">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-muted-foreground">
          Parte de la plantilla <strong>{templateName}</strong> (se cambia en
          Datos). Lo que no toques aquí se queda como en la plantilla.
        </p>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Colores</CardTitle>
              <div className="flex gap-1">
                <Button
                  disabled={colorHistory.length === 0}
                  onClick={previousColors}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Undo2Icon /> Anterior
                </Button>
                <Button
                  onClick={shuffleColors}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <ShuffleIcon /> Combinación al azar
                </Button>
              </div>
            </div>
            <CardDescription>
              {warningCount > 0
                ? `${warningCount} ${warningCount === 1 ? 'combinación se lee' : 'combinaciones se leen'} mal: revisa los avisos.`
                : 'Los colores que cambies se revisan para que el texto se lea bien.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {COLOR_KEYS.map((key) => (
              <ColorField
                changed={Boolean(draft.colors?.[key])}
                hint={COLOR_LABELS[key].hint}
                key={key}
                label={COLOR_LABELS[key].label}
                onChange={(hex) => setColor(key, hex)}
                value={theme.colors[key]}
                warnings={warnings[key]}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipografías</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            {(Object.keys(FONT_SLOTS) as FontSlot[]).map((slot) => (
              <FontField
                key={slot}
                label={FONT_SLOTS[slot]}
                onChange={(key) =>
                  setDraft((current) => ({
                    ...current,
                    fonts: { ...current.fonts, [slot]: key },
                  }))
                }
                templateFont={fontKeyOf(baseTheme.fonts[slot])}
                value={draft.fonts?.[slot]}
              />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movimiento</CardTitle>
            <CardDescription>
              Animaciones al deslizar la invitación. Desliza la vista previa
              para verlas. Si el invitado tiene activado "reducir movimiento" en
              su celular, no se animan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MotionField
              onChange={(motion) =>
                setDraft((current) => ({
                  ...current,
                  // The template's own preset is stored as "no change".
                  motion:
                    motion === (baseTheme.motion ?? 'soft')
                      ? undefined
                      : motion,
                }))
              }
              value={theme.motion ?? 'soft'}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fondo y sobre</CardTitle>
            <CardDescription>
              Imágenes hechas en Canva u otro programa. El sello y la decoración
              deben tener fondo transparente (PNG).
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <ArtImageField
              eventId={eventId}
              hint="Detrás de la invitación y del sobre. Horizontal, 1600 × 1000 o más."
              label="Fondo"
              onChange={(url) =>
                setDraft((current) => ({ ...current, stageImage: url }))
              }
              shape="wide"
              templateImage={urlIn(baseTheme.stage)}
              value={draft.stageImage}
            />
            <ArtImageField
              eventId={eventId}
              hint="Textura del papel del sobre. Cuadrada, 800 × 800."
              label="Papel del sobre"
              onChange={(url) => setEnvelope('paperImage', url)}
              shape="tall"
              templateImage={urlIn(baseTheme.envelope.paper)}
              value={draft.envelope?.paperImage}
            />
            <ArtImageField
              eventId={eventId}
              hint="PNG transparente, cuadrado, 300 × 300. Las iniciales se ponen encima."
              label="Sello"
              onChange={(url) => setEnvelope('sealImage', url)}
              shape="square"
              templateImage={baseTheme.envelope.sealImage}
              value={draft.envelope?.sealImage}
            />
            <ArtImageField
              eventId={eventId}
              hint="PNG transparente que cruza el sobre en diagonal (flores, ramita)."
              label="Decoración"
              onChange={(url) => setEnvelope('decorationImage', url)}
              shape="wide"
              templateImage={baseTheme.envelope.decorationImage}
              value={draft.envelope?.decorationImage}
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <ColorField
                changed={Boolean(draft.envelope?.paperColor)}
                hint="Si no hay papel."
                label="Color del sobre"
                onChange={(hex) => setEnvelope('paperColor', hex)}
                value={draft.envelope?.paperColor ?? theme.colors.primary}
              />
              <ColorField
                changed={Boolean(draft.envelope?.seal)}
                hint="Si no hay imagen."
                label="Color del sello"
                onChange={(hex) => setEnvelope('seal', hex)}
                value={theme.envelope.seal}
              />
              <ColorField
                changed={Boolean(draft.envelope?.ink)}
                hint='"Para Abraham y Ana".'
                label="Texto del sobre"
                onChange={(hex) => setEnvelope('ink', hex)}
                value={theme.envelope.ink}
              />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-2 border-t bg-background/90 px-4 py-3 backdrop-blur">
          {dirty ? (
            <span className="mr-auto text-sm text-muted-foreground">
              Cambios sin guardar
            </span>
          ) : null}
          <Button
            disabled={Object.keys(draft).length === 0}
            onClick={() => setDraft({})}
            type="button"
            variant="ghost"
          >
            Volver a la plantilla
          </Button>
          <Button
            disabled={!dirty}
            onClick={() => setDraft(saved)}
            type="button"
            variant="ghost"
          >
            Descartar
          </Button>
          <Button disabled={!dirty || saving} onClick={save} type="button">
            {saving ? 'Guardando…' : 'Guardar diseño'}
          </Button>
        </div>
      </div>

      <aside className="hidden xl:block">
        <PreviewPane
          eventId={eventId}
          liveTheme={liveTheme}
          version={version}
          withEnvelope
        />
      </aside>
    </div>
  )
}
