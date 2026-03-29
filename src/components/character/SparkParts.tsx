'use client';

import React from 'react';

// ─── HairIdle ───────────────────────────────────────────────────────────────
// Hood pulled up over head — fabric-draped, relaxed, completely covers hair

export const HairIdle: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g style={{ opacity }}>
    {/* Hood main fabric mass — large, draping over skull */}
    <path
      d="M178 175 C172 155 168 130 170 105 C172 80 180 58 194 42 C206 28 220 20 236 18 C252 16 268 22 280 36 C294 52 300 74 300 100 C300 126 296 150 290 170 C284 185 278 192 270 196"
      fill="#1a2535"
      stroke="#141d2a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hood center seam */}
    <path
      d="M234 20 C233 40 233 65 234 90 C235 115 236 140 235 165"
      fill="none"
      stroke="#141d2a"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeDasharray="5 3"
    />
    {/* Hood left drape — fabric fold going down to shoulder */}
    <path
      d="M178 175 C172 185 168 198 166 212 C164 224 165 234 168 240 C180 238 192 234 200 228"
      fill="#1a2535"
      stroke="#141d2a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hood right drape — fabric fold going down to shoulder */}
    <path
      d="M290 170 C296 182 300 196 300 210 C300 222 298 232 294 238 C282 236 270 232 263 226"
      fill="#1a2535"
      stroke="#141d2a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hood rim / edge — front opening, frames the face */}
    <path
      d="M186 192 C188 200 190 208 192 214 C196 224 202 230 210 234 C218 237 228 238 234 238 C240 238 250 237 258 234 C266 230 272 224 275 214 C278 205 280 196 280 188"
      fill="none"
      stroke="#263547"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Hood fabric wrinkle left */}
    <path
      d="M182 155 C178 168 176 180 177 192"
      fill="none"
      stroke="#141d2a"
      strokeWidth="1.0"
      strokeLinecap="round"
    />
    {/* Hood fabric wrinkle right */}
    <path
      d="M286 150 C290 164 291 178 289 190"
      fill="none"
      stroke="#141d2a"
      strokeWidth="1.0"
      strokeLinecap="round"
    />
    {/* Hood top — slight peak at crown */}
    <path
      d="M210 22 C218 14 228 10 236 10 C244 10 254 14 260 22"
      fill="none"
      stroke="#141d2a"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Small hair peek at forehead — just a hint of dark hair */}
    <path
      d="M208 192 C212 188 220 185 234 185 C248 185 256 188 260 192"
      fill="#100c06"
      stroke="none"
    />
  </g>
);

// ─── HairShocked ─────────────────────────────────────────────────────────────
// Hood BLOWN BACK — hair fully exposed, standing straight up, electric

export const HairShocked: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <g style={{ opacity, pointerEvents: 'none' }}>

    {/* ── Exposed hair base — now visible under blown-back hood ── */}
    {/* Hair skull mass — dark brown, covers top of head */}
    <path
      d="M190 175 C183 152 180 124 184 98 C188 72 198 52 214 38 C224 28 236 22 250 22 C264 22 276 30 285 44 C296 62 298 88 295 114 C292 136 286 156 278 170"
      fill="#1a0e04"
      stroke="#120a02"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* ── SHOCKED SPIKES — dramatically standing up ── */}

    {/* CENTER SPIKE — tallest, shoots straight up 90px above head */}
    <path
      d="M234 38 C232 18 230 -4 232 -28 C233 -44 237 -58 242 -68 C246 -78 251 -78 255 -68 C259 -56 257 -38 253 -18 C250 2 246 20 242 34"
      fill="#1a0e04"
      stroke="#120a02"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* CENTER SPIKE — electric yellow core */}
    <path
      d="M236 30 C234 10 232 -10 234 -30 C236 -46 240 -58 244 -50 C248 -40 246 -22 243 -4 C240 12 237 26 235 34"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.9"
    />

    {/* LEFT-CENTER SPIKE — angled left, very tall */}
    <path
      d="M214 42 C208 20 202 -2 200 -24 C198 -40 200 -52 206 -56 C212 -60 218 -52 220 -36 C222 -20 220 -2 218 16 C216 28 215 38 214 44"
      fill="#1a0e04"
      stroke="#120a02"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* LEFT-CENTER SPIKE — electric core */}
    <path
      d="M216 36 C212 16 208 -4 207 -22 C206 -36 208 -48 213 -50"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* RIGHT-CENTER SPIKE — angled right, very tall */}
    <path
      d="M256 40 C262 18 267 -4 268 -26 C269 -42 267 -54 261 -58 C255 -62 249 -54 248 -38 C247 -22 249 -4 252 14 C254 26 255 36 256 42"
      fill="#1a0e04"
      stroke="#120a02"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* RIGHT-CENTER SPIKE — electric core */}
    <path
      d="M254 34 C258 14 262 -6 262 -24 C262 -38 260 -50 255 -52"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.8"
    />

    {/* FAR LEFT SPIKE — flies out hard to the left */}
    <path
      d="M192 100 C170 78 146 56 120 42 C104 32 88 32 84 44 C80 56 92 72 112 84 C134 98 160 106 180 110"
      fill="#1a0e04"
      stroke="#120a02"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* FAR LEFT SPIKE — electric edge */}
    <path
      d="M190 96 C168 74 144 54 118 40 C102 30 88 32 84 44"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* FAR RIGHT SPIKE — flies out hard to the right */}
    <path
      d="M276 98 C298 76 322 56 346 42 C362 32 378 32 382 44 C386 56 374 72 354 84 C332 98 306 106 288 110"
      fill="#1a0e04"
      stroke="#120a02"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* FAR RIGHT SPIKE — electric edge */}
    <path
      d="M278 94 C300 72 324 54 348 40 C364 30 378 32 382 44"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />

    {/* ── Hood blown back — now hangs behind head ── */}
    {/* Hood blown back left side — hanging behind/below */}
    <path
      d="M188 175 C180 188 174 205 172 222 C170 238 172 250 178 256 C170 252 163 244 160 232 C157 218 160 202 166 188 C172 175 180 166 188 162"
      fill="#1a2535"
      stroke="#141d2a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hood blown back right side — hanging behind/below */}
    <path
      d="M280 172 C288 186 293 203 294 220 C295 236 292 248 286 254 C294 250 300 242 303 230 C306 216 303 200 297 186 C291 172 284 163 276 160"
      fill="#1a2535"
      stroke="#141d2a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hood back panel — visible behind head now */}
    <path
      d="M188 162 C184 148 182 128 184 106 C186 82 194 60 208 44 C220 30 234 22 234 22 C234 22 248 30 262 44 C276 60 282 82 283 108 C283 130 280 150 276 164"
      fill="#162030"
      stroke="#141d2a"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* ── Electric zigzag sparks ── */}
    <path
      d="M226 -8 L220 -18 L228 -22 L222 -34"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M250 -10 L256 -20 L248 -24 L254 -36"
      fill="none"
      stroke="#ffe535"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M160 62 L152 54 L160 50 L153 42"
      fill="none"
      stroke="#ffe535"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M310 60 L318 52 L310 48 L317 40"
      fill="none"
      stroke="#ffe535"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M194 -18 L188 -26 L196 -30"
      fill="none"
      stroke="#ffe535"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M278 -16 L284 -24 L276 -28"
      fill="none"
      stroke="#ffe535"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* ── Floating electric dots — static discharge ── */}
    <circle cx="204" cy="10" r="2.5" fill="#ffe535" opacity="0.9" />
    <circle cx="266" cy="8" r="2.5" fill="#ffe535" opacity="0.9" />
    <circle cx="142" cy="52" r="2" fill="#ffe535" opacity="0.7" />
    <circle cx="328" cy="50" r="2" fill="#ffe535" opacity="0.7" />
    <circle cx="236" cy="-42" r="3" fill="#ffe535" opacity="0.8" />
    <circle cx="218" cy="-44" r="1.8" fill="#ffe535" opacity="0.6" />
    <circle cx="254" cy="-46" r="1.8" fill="#ffe535" opacity="0.6" />
    <circle cx="176" cy="30" r="1.5" fill="#ffe535" opacity="0.6" />
    <circle cx="296" cy="28" r="1.5" fill="#ffe535" opacity="0.6" />

    {/* ── Glow aura around entire shocked head ── */}
    <ellipse
      cx="234"
      cy="80"
      rx="80"
      ry="90"
      fill="none"
      stroke="rgba(255,229,53,0.12)"
      strokeWidth="12"
    />
  </g>
);

// ─── FaceNeutral ─────────────────────────────────────────────────────────────
// Shadowed face inside hood — mostly dark, just enough detail visible

export const FaceNeutral: React.FC = () => (
  <g>
    {/* Face — darker, inside hood shadow */}
    <ellipse
      cx="234"
      cy="176"
      rx="50"
      ry="58"
      fill="#a06828"
      stroke="#8a5520"
      strokeWidth="1.0"
    />
    {/* Hood shadow overlay — makes face look inside hood */}
    <ellipse
      cx="234"
      cy="168"
      rx="48"
      ry="44"
      fill="rgba(15,20,30,0.45)"
    />
    {/* Right ear — just barely visible at hood edge */}
    <path
      d="M284 174 C290 170 293 175 292 182 C291 188 288 192 284 189"
      fill="#a06828"
      stroke="#8a5520"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
    {/* Nose — subtle in shadow */}
    <path
      d="M230 178 C232 184 235 187 239 185"
      fill="none"
      stroke="#8a5520"
      strokeWidth="1.0"
      strokeLinecap="round"
    />
    {/* Mouth — subtle */}
    <path
      d="M222 200 C228 204 234 205 240 204 C246 202 250 199 252 197"
      fill="none"
      stroke="#8a5520"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
    {/* Beard stubble */}
    <path d="M216 207 C216 210 217 212" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M223 211 C223 208 224 206" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M230 213 C231 210 232 208" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M237 214 C237 211 238 209" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M244 212 C245 209 245 207" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M251 209 C251 206 252 204" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
  </g>
);

// ─── FaceRelaxed ─────────────────────────────────────────────────────────────

export const FaceRelaxed: React.FC = () => (
  <g>
    <ellipse
      cx="234"
      cy="178"
      rx="50"
      ry="57"
      fill="#a06828"
      stroke="#8a5520"
      strokeWidth="1.0"
    />
    {/* Hood shadow — slightly lighter for relaxed */}
    <ellipse
      cx="234"
      cy="170"
      rx="47"
      ry="42"
      fill="rgba(15,20,30,0.35)"
    />
    <path
      d="M283 176 C289 172 292 177 291 184 C290 190 287 193 283 190"
      fill="#a06828"
      stroke="#8a5520"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
    {/* Nose */}
    <path
      d="M231 180 C233 186 236 188 240 186"
      fill="none"
      stroke="#8a5520"
      strokeWidth="0.9"
      strokeLinecap="round"
    />
    {/* Relaxed slight smile */}
    <path
      d="M220 202 C226 207 234 208 242 207 C248 205 253 202 255 199"
      fill="none"
      stroke="#8a5520"
      strokeWidth="1.0"
      strokeLinecap="round"
    />
    <path d="M220 211 C220 208 221 206" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M228 214 C228 211 229 209" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M237 215 C237 212 238 210" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M246 213 C246 210 247 208" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
  </g>
);

// ─── Sunglasses ───────────────────────────────────────────────────────────────

export const Sunglasses: React.FC = () => (
  <g>
    {/* Left lens — slightly larger, more stylish */}
    <rect
      x="172"
      y="156"
      width="58"
      height="24"
      rx="9"
      fill="rgba(0,0,0,0.8)"
      stroke="#0a0a0a"
      strokeWidth="2.5"
    />
    {/* Right lens */}
    <rect
      x="238"
      y="156"
      width="58"
      height="24"
      rx="9"
      fill="rgba(0,0,0,0.8)"
      stroke="#0a0a0a"
      strokeWidth="2.5"
    />
    {/* Nose bridge */}
    <path
      d="M230 167 C232 164 236 163 240 164 C240 167 238 169 236 169 C234 169 232 168 230 167 Z"
      fill="#0a0a0a"
      stroke="none"
    />
    {/* Left temple */}
    <path
      d="M172 168 C162 167 154 167 148 170"
      fill="none"
      stroke="#0a0a0a"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Right temple */}
    <path
      d="M296 168 C306 167 314 167 320 170"
      fill="none"
      stroke="#0a0a0a"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Left lens shine */}
    <path
      d="M180 161 C183 159 188 159 190 161"
      fill="none"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M180 165 C182 163 185 163 187 165"
      fill="none"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Right lens shine */}
    <path
      d="M246 161 C249 159 254 159 256 161"
      fill="none"
      stroke="rgba(255,255,255,0.25)"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M246 165 C248 163 251 163 253 165"
      fill="none"
      stroke="rgba(255,255,255,0.12)"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Monitor screen reflection in lenses — cyan tint */}
    <rect x="174" y="158" width="54" height="20" rx="7" fill="rgba(0,180,220,0.06)" />
    <rect x="240" y="158" width="54" height="20" rx="7" fill="rgba(0,180,220,0.06)" />
  </g>
);

// ─── Body ─────────────────────────────────────────────────────────────────────

export const Body: React.FC = () => (
  <g>
    {/* Hoodie torso — body connects to stool seat at y≈358 */}
    <path
      d="M192 240 C182 248 172 262 169 282 C166 302 168 324 172 344 C202 354 240 356 278 353 C296 351 310 346 312 344 C316 326 317 304 312 280 C308 260 296 246 286 240 C274 233 264 228 240 226 C216 224 204 232 192 240 Z"
      fill="#1e2a3a"
      stroke="#1a2535"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Hoodie darker side shadows for volume */}
    <path
      d="M192 240 C182 248 172 262 169 282 C167 296 168 316 171 336"
      fill="none"
      stroke="#141d2a"
      strokeWidth="8"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M286 240 C296 248 306 260 309 278 C312 294 311 316 308 336"
      fill="none"
      stroke="#141d2a"
      strokeWidth="8"
      strokeLinecap="round"
      opacity="0.6"
    />
    {/* Collar — V-neck visible below hood */}
    <path
      d="M216 232 C220 224 228 220 234 218 C240 220 248 224 252 232"
      fill="none"
      stroke="#263547"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Hood-to-body seam line */}
    <path
      d="M186 240 C196 244 214 246 234 246 C254 246 272 244 282 240"
      fill="none"
      stroke="#263547"
      strokeWidth="1.0"
      strokeLinecap="round"
      strokeDasharray="4 2"
    />
    {/* Center front seam */}
    <path
      d="M234 218 C234 230 234 248 234 268"
      fill="none"
      stroke="#263547"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeDasharray="3 2"
    />
    {/* Pocket — recessed look */}
    <rect
      x="213"
      y="294"
      width="54"
      height="38"
      rx="4"
      fill="#192230"
      stroke="#263547"
      strokeWidth="1.2"
    />
    {/* Pocket seam detail */}
    <path
      d="M213 302 L267 302"
      fill="none"
      stroke="#263547"
      strokeWidth="0.6"
      strokeLinecap="round"
    />
    {/* Circuit trace inside pocket */}
    <path
      d="M222 310 L222 318 L234 318 L234 314"
      fill="none"
      stroke="#2a3d52"
      strokeWidth="1.0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M258 318 L258 308 L246 308 L246 312"
      fill="none"
      stroke="#2a3d52"
      strokeWidth="1.0"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* PCB pad dots */}
    <circle cx="234" cy="314" r="1.5" fill="#2a3d52" />
    <circle cx="246" cy="312" r="1.5" fill="#2a3d52" />
    {/* Hoodie drawstrings */}
    <path
      d="M224 230 C222 242 220 256 219 270 C218 280 220 288 222 294"
      fill="none"
      stroke="#263547"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M244 230 C246 242 248 256 249 270 C250 280 248 288 246 294"
      fill="none"
      stroke="#263547"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Drawstring tips */}
    <ellipse cx="222" cy="296" rx="3" ry="5" fill="#263547" stroke="#1e2a3a" strokeWidth="0.8" />
    <ellipse cx="246" cy="296" rx="3" ry="5" fill="#263547" stroke="#1e2a3a" strokeWidth="0.8" />
  </g>
);

// ─── LeftArm ─────────────────────────────────────────────────────────────────

export const LeftArm: React.FC<{ rotation?: number }> = ({ rotation = 0 }) => (
  <g>
    {/* Upper arm — thick, fabric */}
    <path
      d="M175 260 C167 270 159 286 157 304 C156 316 158 326 164 334"
      fill="none"
      stroke="#1e2a3a"
      strokeWidth="24"
      strokeLinecap="round"
    />
    {/* Upper arm darker side */}
    <path
      d="M175 260 C167 270 159 286 157 304 C156 316 158 326 164 334"
      fill="none"
      stroke="#141d2a"
      strokeWidth="22"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Arm seam */}
    <path
      d="M175 260 C167 270 159 286 157 304 C156 316 158 326 164 334"
      fill="none"
      stroke="#263547"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Forearm on desk */}
    <path
      d="M164 334 C166 342 170 348 176 352 C184 355 200 354 216 351 C228 349 234 347 238 346"
      fill="none"
      stroke="#1e2a3a"
      strokeWidth="20"
      strokeLinecap="round"
    />
    <path
      d="M164 334 C166 342 170 348 176 352 C184 355 200 354 216 351 C228 349 234 347 238 346"
      fill="none"
      stroke="#263547"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Wrist cuff */}
    <path
      d="M228 347 C232 347 236 346 238 345"
      fill="none"
      stroke="#263547"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hand — thinking pose, at side of head */}
    <g transform={`rotate(${rotation}, 174, 344)`}>
      {/* Palm */}
      <path
        d="M162 328 C158 322 156 314 159 307 C162 301 168 299 175 302 C182 305 185 312 184 320 C183 327 179 332 174 333 C169 334 164 332 162 328 Z"
        fill="#a06828"
        stroke="#8a5520"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Thumb */}
      <path
        d="M160 322 C155 320 152 315 154 310 C156 306 160 305 163 308"
        fill="none"
        stroke="#8a5520"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Index finger hint */}
      <path
        d="M158 316 C154 313 152 308 154 305"
        fill="none"
        stroke="#8a5520"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
      {/* Knuckle lines */}
      <path d="M168 310 C170 308 173 308 174 310" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
      <path d="M168 316 C170 314 173 314 175 316" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    </g>
  </g>
);

// ─── RightArm ─────────────────────────────────────────────────────────────────

export const RightArm: React.FC<{ y?: number }> = ({ y = 0 }) => (
  <g transform={`translate(0, ${y})`}>
    {/* Upper arm — angles down from shoulder to desk level */}
    <path
      d="M293 256 C303 268 311 284 311 302 C311 314 308 326 302 334"
      fill="none"
      stroke="#1e2a3a"
      strokeWidth="24"
      strokeLinecap="round"
    />
    <path
      d="M293 256 C303 268 311 284 311 302 C311 314 308 326 302 334"
      fill="none"
      stroke="#141d2a"
      strokeWidth="22"
      strokeLinecap="round"
      opacity="0.4"
    />
    <path
      d="M293 256 C303 268 311 284 311 302 C311 314 308 326 302 334"
      fill="none"
      stroke="#263547"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Forearm resting flat on desk surface ~y=336 */}
    <path
      d="M302 334 C299 337 294 339 287 340 C274 341 262 340 254 338"
      fill="none"
      stroke="#1e2a3a"
      strokeWidth="20"
      strokeLinecap="round"
    />
    <path
      d="M302 334 C299 337 294 339 287 340 C274 341 262 340 254 338"
      fill="none"
      stroke="#263547"
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    {/* Wrist cuff */}
    <path
      d="M260 339 C256 339 254 338 252 337"
      fill="none"
      stroke="#263547"
      strokeWidth="3"
      strokeLinecap="round"
    />
    {/* Hand resting on desk */}
    <path
      d="M312 328 C318 322 320 314 318 307 C316 301 310 298 304 301 C298 304 296 311 297 319 C298 325 303 329 309 330 C312 330 313 329 312 328 Z"
      fill="#a06828"
      stroke="#8a5520"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    {/* Thumb right */}
    <path
      d="M319 313 C324 311 326 306 324 301 C322 297 318 297 315 300"
      fill="none"
      stroke="#8a5520"
      strokeWidth="3.5"
      strokeLinecap="round"
    />
    {/* Knuckle lines */}
    <path d="M305 309 C307 307 310 307 311 309" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M305 315 C307 313 310 313 312 315" fill="none" stroke="#8a5520" strokeWidth="0.6" strokeLinecap="round" />
  </g>
);

// ─── Legs ─────────────────────────────────────────────────────────────────────

export const Legs: React.FC<{ swingAngle?: number }> = ({ swingAngle = 0 }) => (
  <g>
    {/* Left leg */}
    <g transform={`rotate(${-swingAngle}, 220, 362)`}>
      {/* Thigh — dark jeans, hangs from stool seat at y≈362 */}
      <path
        d="M222 362 C218 382 214 404 213 422 C212 434 213 444 216 450"
        fill="none"
        stroke="#1e2d42"
        strokeWidth="24"
        strokeLinecap="round"
      />
      {/* Jean highlight */}
      <path
        d="M222 362 C218 382 214 404 213 422 C212 434 213 444 216 450"
        fill="none"
        stroke="#263a52"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Knee area */}
      <ellipse cx="215" cy="406" rx="10" ry="6" fill="none" stroke="#1a2838" strokeWidth="1.5" />
      {/* Left shoe — chunky sneaker */}
      <path
        d="M204 446 C198 450 193 455 192 460 C191 465 194 470 202 472 C212 474 224 473 230 469 C234 466 234 461 232 456 C230 451 224 448 216 447 Z"
        fill="#141414"
        stroke="#1e1e1e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shoe sole */}
      <path
        d="M192 466 C192 470 196 473 204 474 C214 475 226 474 232 470"
        fill="none"
        stroke="#333"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Shoe lace area */}
      <path
        d="M200 456 C206 453 214 452 222 454"
        fill="none"
        stroke="#2a2a2a"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Loose lace dangling */}
      <path
        d="M200 456 C197 460 196 465 198 468"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.0"
        strokeLinecap="round"
      />
      <path
        d="M198 468 C196 471 196 473 198 474"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.0"
        strokeLinecap="round"
      />
      {/* Shoe brand stripe */}
      <path
        d="M196 460 C202 457 212 456 220 458"
        fill="none"
        stroke="rgba(0,212,255,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>

    {/* Right leg */}
    <g transform={`rotate(${swingAngle}, 258, 362)`}>
      <path
        d="M256 362 C260 382 264 404 265 422 C266 434 265 444 262 450"
        fill="none"
        stroke="#1e2d42"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <path
        d="M256 362 C260 382 264 404 265 422 C266 434 265 444 262 450"
        fill="none"
        stroke="#263a52"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.4"
      />
      {/* Knee area */}
      <ellipse cx="263" cy="406" rx="10" ry="6" fill="none" stroke="#1a2838" strokeWidth="1.5" />
      {/* Right shoe */}
      <path
        d="M250 446 C248 450 246 455 248 460 C250 465 256 470 266 472 C276 473 286 471 290 466 C293 462 292 457 288 453 C284 450 276 448 266 447 Z"
        fill="#141414"
        stroke="#1e1e1e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Shoe sole */}
      <path
        d="M248 466 C250 470 256 473 266 474 C276 474 284 472 290 468"
        fill="none"
        stroke="#333"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Lace */}
      <path
        d="M256 454 C262 452 270 452 276 454"
        fill="none"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.0"
        strokeLinecap="round"
      />
      {/* Shoe brand stripe */}
      <path
        d="M252 460 C258 457 268 456 276 458"
        fill="none"
        stroke="rgba(0,212,255,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  </g>
);

// ─── Stool ────────────────────────────────────────────────────────────────────

export const Stool: React.FC = () => (
  <g>
    {/* Seat cushion — directly under body bottom */}
    <ellipse cx="240" cy="358" rx="54" ry="15" fill="#7a5230" stroke="#5a3c20" strokeWidth="1.5" />
    {/* Seat top highlight */}
    <ellipse cx="236" cy="355" rx="36" ry="7" fill="rgba(255,255,255,0.06)" />
    {/* Seat rim */}
    <path
      d="M186 358 C186 366 196 374 240 374 C284 374 294 366 294 358"
      fill="#5a3c20"
      stroke="none"
    />
    {/* Front left leg */}
    <path
      d="M198 368 C194 390 190 412 188 434 C187 448 188 458 192 462"
      fill="none"
      stroke="#5a3c20"
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* Front right leg */}
    <path
      d="M282 368 C286 390 289 412 290 434 C291 448 290 458 287 462"
      fill="none"
      stroke="#5a3c20"
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* Back legs */}
    <path
      d="M212 361 C208 378 206 396 206 410"
      fill="none"
      stroke="#5a3c20"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path
      d="M268 361 C272 378 274 396 274 410"
      fill="none"
      stroke="#5a3c20"
      strokeWidth="5"
      strokeLinecap="round"
      opacity="0.7"
    />
    {/* Cross brace */}
    <path
      d="M191 418 C216 422 264 422 287 418"
      fill="none"
      stroke="#5a3c20"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Leg floor caps */}
    <ellipse cx="192" cy="463" rx="5" ry="3" fill="#3a2010" />
    <ellipse cx="287" cy="463" rx="5" ry="3" fill="#3a2010" />
  </g>
);

// ─── DeskSetup ────────────────────────────────────────────────────────────────

export const DeskSetup: React.FC<{ scrollProgress?: number }> = ({ scrollProgress = 0 }) => {
  // Map 0–1 scroll to which "page" section shows on screen
  // 0 = hero, 0.2 = about, 0.4 = skills, 0.6 = projects, 0.8 = experience, 1.0 = contact
  const section = scrollProgress < 0.18 ? 'hero'
    : scrollProgress < 0.36 ? 'about'
    : scrollProgress < 0.54 ? 'skills'
    : scrollProgress < 0.72 ? 'projects'
    : scrollProgress < 0.88 ? 'experience'
    : 'contact';

  // Vertical offset for smooth scroll illusion within the screen
  const scrollY = (scrollProgress % 0.18) / 0.18; // 0–1 within each section

  return (
  <g>
    {/* Desk surface — thick slab, top surface at y=324, arms rest at y≈336-340 */}
    <path
      d="M60 328 C60 322 65 318 72 316 L440 316 C447 316 452 320 452 326 L452 346 C452 352 447 356 440 356 L72 356 C65 356 60 352 60 346 Z"
      fill="#24180e"
      stroke="#1a1008"
      strokeWidth="1.5"
    />
    {/* Desk top surface — lighter */}
    <path
      d="M62 328 L450 328 L450 332 C420 331 320 330 240 330 C160 330 80 331 62 332 Z"
      fill="#2e1f10"
      stroke="none"
    />
    {/* Grain lines */}
    <path d="M80 324 C160 322 260 323 360 324 C400 324 430 323 448 324" fill="none" stroke="#1a1008" strokeWidth="0.6" strokeLinecap="round" />
    <path d="M76 334 C170 332 270 333 370 333 C400 333 430 332 448 334" fill="none" stroke="#1a1008" strokeWidth="0.5" strokeLinecap="round" />
    <path d="M80 342 C200 340 320 341 440 342" fill="none" stroke="#1a1008" strokeWidth="0.5" strokeLinecap="round" />
    {/* Desk front shadow */}
    <rect x="60" y="348" width="392" height="8" rx="0" fill="rgba(0,0,0,0.3)" />

    {/* Laptop lid and hinge rendered here — BEFORE arms so body covers the lid naturally */}
    {/* Laptop hinge — the pivot point at back of keyboard base */}
    <path
      d="M120 328 C160 320 240 318 280 322 C300 324 320 326 330 330"
      fill="none"
      stroke="#0d0d0d"
      strokeWidth="4"
      strokeLinecap="round"
    />
    {/* Lid outer shell — shallow realistic angle */}
    <path
      d="M105 328 C110 310 115 280 125 260 C135 235 155 220 185 215 C225 210 280 210 320 218 C345 223 360 240 368 270 C375 300 373 318 365 328"
      fill="#1c1c1e"
      stroke="#111"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Dell logo */}
    <ellipse cx="215" cy="235" rx="10" ry="9" fill="#141414" stroke="#282828" strokeWidth="1" />
    <text x="215" y="240" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="rgba(255,255,255,0.10)">DELL</text>

    {/* Screen bezel */}
    <path
      d="M110 328 C115 305 120 270 130 250 C142 225 162 210 190 205 C240 198 290 198 330 210 C355 218 368 240 375 275 C378 310 375 325 368 328"
      fill="#111111"
      stroke="#1a1a1a"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />

    {/* Screen clip — top at y=210, bottom at y=328 */}
    <clipPath id="screen-clip">
      <polygon points="112,328 368,328 362,210 118,210" />
    </clipPath>

    {/* Screen background */}
    <polygon points="112,328 368,328 362,210 118,210" fill="#07090f" />

    {/* Portfolio UI */}
    <g clipPath="url(#screen-clip)">
      <rect x="112" y="210" width="256" height="118" fill="#07090f" />

      {/* Nav bar */}
      <rect x="112" y="210" width="256" height="18" fill="#0d1117" />
      <text x="120" y="223" fontFamily="sans-serif" fontSize="6" fontWeight="600" fill="#f0f4ff" opacity="0.9">Moon</text>
      <text x="180" y="223" fontFamily="sans-serif" fontSize="5.5" fill={section === 'hero' ? '#00d4ff' : '#6a7a9a'}>About</text>
      <text x="240" y="223" fontFamily="sans-serif" fontSize="5.5" fill={section === 'skills' ? '#00d4ff' : '#6a7a9a'}>Skills</text>
      <text x="290" y="223" fontFamily="sans-serif" fontSize="5.5" fill={section === 'projects' ? '#00d4ff' : '#6a7a9a'}>Projects</text>
      <text x="350" y="223" fontFamily="sans-serif" fontSize="5.5" fill={section === 'contact' ? '#00d4ff' : '#6a7a9a'}>Contact</text>
      <line x1="112" y1="230" x2="368" y2="230" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />

      {/* Scrollable content */}
      <clipPath id="screen-content-clip">
        <rect x="112" y="230" width="256" height="98" />
      </clipPath>
      <g clipPath="url(#screen-content-clip)">
        <g transform={`translate(0, ${-scrollProgress * 490})`}>

          {/* HERO — y=230 */}
          <rect x="112" y="230" width="256" height="98" fill="#07090f" />
          <text x="125" y="250" fontFamily="monospace" fontSize="5.5" fill="#00d4ff" opacity="0.85">EEE STUDENT &amp; FULL-STACK DEV</text>
          <text x="125" y="270" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="#f0f4ff">I build things</text>
          <text x="125" y="290" fontFamily="sans-serif" fontSize="10" fontWeight="700" fill="#f0f4ff">that run on electricity.</text>
          <rect x="125" y="305" width="45" height="12" rx="3" fill="#00d4ff" />
          <text x="147" y="317" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="#07090f">View Work</text>
          <rect x="180" y="305" width="45" height="12" rx="3" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
          <text x="202" y="317" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fill="#f0f4ff" opacity="0.7">Contact</text>

          {/* ABOUT — y=328 */}
          <rect x="112" y="328" width="256" height="98" fill="#0d1117" />
          <text x="125" y="355" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#f0f4ff">sys.whoami()</text>
          <rect x="125" y="365" width="120" height="4" rx="2" fill="#6a7a9a" opacity="0.4" />
          <rect x="125" y="375" width="85" height="4" rx="2" fill="#6a7a9a" opacity="0.3" />
          <rect x="125" y="390" width="38" height="20" rx="3" fill="#141b24" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />
          <text x="144" y="407" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#00d4ff">8+</text>
          <rect x="170" y="390" width="38" height="20" rx="3" fill="#141b24" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />
          <text x="189" y="407" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#00d4ff">3+</text>
          <rect x="215" y="390" width="38" height="20" rx="3" fill="#141b24" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />
          <text x="234" y="407" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="#00d4ff">∞</text>

          {/* SKILLS — y=426 */}
          <rect x="112" y="426" width="256" height="98" fill="#07090f" />
          <text x="125" y="455" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#f0f4ff">skills.json</text>
          <rect x="125" y="470" width="45" height="12" rx="3" fill="#141b24" stroke="rgba(0,212,255,0.4)" strokeWidth="1" />
          <text x="147" y="482" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#00d4ff">Next.js</text>
          <rect x="180" y="470" width="55" height="12" rx="3" fill="#141b24" stroke="rgba(0,212,255,0.4)" strokeWidth="1" />
          <text x="207" y="482" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#00d4ff">TypeScript</text>
          <rect x="125" y="495" width="200" height="8" rx="2" fill="#141b24" />
          <rect x="125" y="495" width="150" height="8" rx="2" fill="rgba(0,212,255,0.55)" />

          {/* CONTACT — y=524 */}
          <rect x="112" y="524" width="256" height="98" fill="#07090f" />
          <text x="125" y="555" fontFamily="monospace" fontSize="11" fontWeight="700" fill="#f0f4ff">connect()</text>
          <rect x="125" y="570" width="210" height="14" rx="3" fill="#141b24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x="135" y="582" fontFamily="sans-serif" fontSize="6" fill="#3d4a5e">Name</text>
          <rect x="125" y="590" width="210" height="14" rx="3" fill="#141b24" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x="135" y="602" fontFamily="sans-serif" fontSize="6" fill="#3d4a5e">Email</text>
          <rect x="125" y="610" width="65" height="12" rx="3" fill="#00d4ff" />
          <text x="157" y="622" textAnchor="middle" fontFamily="sans-serif" fontSize="6" fontWeight="700" fill="#07090f">Send Signal</text>
        </g>
      </g>

      <rect x="112" y="210" width="256" height="118" fill="url(#screen-glow)" opacity="0.03" />
    </g>

    <defs>
      <radialGradient id="screen-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#00d4ff" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>

    {/* Bezel glow */}
    <path d="M135 321 C133 312 134 296 140 282" fill="none" stroke="rgba(0,180,255,0.10)" strokeWidth="3" strokeLinecap="round" />
    <path d="M267 321 C269 312 268 296 263 282" fill="none" stroke="rgba(0,180,255,0.10)" strokeWidth="3" strokeLinecap="round" />
  </g>
  );
};

// ─── LaptopKeyboard ─────────────────────────────────────────────────────────
// Rendered AFTER arms so it appears in front of the character's body

export const LaptopKeyboard: React.FC = () => (
  <g>
    {/* Keyboard base body — sits ON TOP of desk surface, fully visible to viewer */}
    {/* Desk top is at y=316, so keyboard base starts at y=310 to sit on desk */}
    <path
      d="M138 316 L272 316 L276 334 L134 334 Z"
      fill="#161616"
      stroke="#1e1e1e"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Keyboard top surface — faces viewer */}
    <path
      d="M141 317 L270 317 L274 333 L137 333 Z"
      fill="#1e1e1e"
      stroke="none"
    />
    {/* Key row 1 — top, farthest from viewer */}
    <line x1="143" y1="321" x2="268" y2="321" stroke="#2a2a2a" strokeWidth="0.8" strokeLinecap="round" />
    {/* Key row 2 — home row */}
    <line x1="141" y1="325" x2="270" y2="325" stroke="#272727" strokeWidth="0.8" strokeLinecap="round" />
    {/* Key row 3 — bottom, closest to viewer */}
    <line x1="139" y1="329" x2="272" y2="329" strokeWidth="0.8" stroke="#252525" strokeLinecap="round" />
    {/* Key columns */}
    <line x1="162" y1="317" x2="159" y2="333" stroke="#252525" strokeWidth="0.6" strokeLinecap="round" />
    <line x1="182" y1="317" x2="179" y2="333" stroke="#252525" strokeWidth="0.6" strokeLinecap="round" />
    <line x1="202" y1="317" x2="199" y2="333" stroke="#252525" strokeWidth="0.6" strokeLinecap="round" />
    <line x1="222" y1="317" x2="219" y2="333" stroke="#252525" strokeWidth="0.6" strokeLinecap="round" />
    <line x1="242" y1="317" x2="239" y2="333" stroke="#252525" strokeWidth="0.6" strokeLinecap="round" />
    {/* Spacebar */}
    <rect x="170" y="330" width="70" height="2" rx="1" fill="#222" stroke="#333" strokeWidth="0.5" />
    {/* Front lip of base — visible edge facing viewer */}
    <path d="M134 333 L276 333 L276 337 L134 337 Z" fill="#111111" stroke="none" />
    {/* Power LED on front lip */}
    <circle cx="207" cy="335" r="1.5" fill="rgba(0,212,255,0.9)" />
    <circle cx="207" cy="335" r="3" fill="rgba(0,212,255,0.15)" />
  </g>
);

// ─── PCTower ─────────────────────────────────────────────────────────────────

export const PCTower: React.FC = () => (
  <g>
    {/* Main body — sits on desk, top at y≈220, bottom at y≈316 (desk surface) */}
    <rect x="376" y="220" width="58" height="96" rx="5" fill="#0d1420" stroke="#1a2435" strokeWidth="2" />
    {/* Top edge */}
    <rect x="376" y="220" width="58" height="8" rx="5" fill="#141d2e" stroke="none" />
    {/* Glass panel — side window */}
    <rect x="382" y="232" width="46" height="58" rx="3" fill="rgba(0,100,180,0.05)" stroke="#1a2435" strokeWidth="0.8" />
    {/* Internal glow visible through glass */}
    <ellipse cx="405" cy="261" rx="16" ry="20" fill="rgba(0,212,255,0.04)" />
    {/* Drive bay */}
    <rect x="382" y="234" width="42" height="7" rx="2" fill="#0a1020" stroke="#1a2435" strokeWidth="0.8" />
    <rect x="382" y="245" width="42" height="5" rx="1" fill="#0a1020" stroke="#1a2435" strokeWidth="0.6" />
    {/* Power button */}
    <circle cx="392" cy="258" r="4" fill="#0d1420" stroke="#1a2435" strokeWidth="1" />
    <circle cx="392" cy="258" r="2.5" fill="var(--color-accent)" opacity="0.9" />
    <circle cx="392" cy="258" r="5" fill="var(--color-accent)" opacity="0.12" />
    {/* Vent slots */}
    <path d="M400 255 L400 265" fill="none" stroke="#1a2435" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M404 255 L404 265" fill="none" stroke="#1a2435" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M408 255 L408 265" fill="none" stroke="#1a2435" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M412 255 L412 265" fill="none" stroke="#1a2435" strokeWidth="0.8" strokeLinecap="round" />
    <path d="M416 255 L416 265" fill="none" stroke="#1a2435" strokeWidth="0.8" strokeLinecap="round" />
    {/* RGB strip at bottom of tower */}
    <path
      d="M380 308 L430 308"
      fill="none"
      stroke="rgba(0,212,255,0.4)"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M380 308 L430 308"
      fill="none"
      stroke="rgba(0,212,255,0.15)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* Cable port area — near desk surface */}
    <rect x="382" y="302" width="12" height="6" rx="1" fill="#0a1020" stroke="#1a2435" strokeWidth="0.6" />
    <rect x="397" y="302" width="8" height="6" rx="1" fill="#0a1020" stroke="#1a2435" strokeWidth="0.6" />
  </g>
);

// ─── WireAndPulse ─────────────────────────────────────────────────────────────

export const WireAndPulse: React.FC<{ showPulse?: boolean }> = ({ showPulse = true }) => (
  <g>
    {/* Cable shadow — runs from PC tower port at y≈305 */}
    <path
      d="M372 310 C358 312 346 316 334 318 C316 322 306 320 306 310 C306 301 314 296 328 296 C342 296 356 298 370 302 C384 306 406 306 442 296 C462 289 478 288 488 290"
      fill="none"
      stroke="rgba(0,0,0,0.4)"
      strokeWidth="6"
      strokeLinecap="round"
    />
    {/* Cable main — dark rubber */}
    <path
      id="spark-wire-path"
      d="M372 306 C358 308 346 312 334 314 C316 318 306 316 306 306 C306 297 314 292 328 292 C342 292 356 294 370 298 C384 302 406 302 442 292 C462 285 478 284 488 286"
      fill="none"
      stroke="#1a140a"
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    {/* Cable highlight — copper sheen */}
    <path
      d="M372 306 C358 308 346 312 334 314 C316 318 306 316 306 306 C306 297 314 292 328 292 C342 292 356 294 370 298 C384 302 406 302 442 292 C462 285 478 284 488 286"
      fill="none"
      stroke="#e8880a"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.35"
    />
    {/* USB connector at PC */}
    <rect x="368" y="301" width="12" height="9" rx="2" fill="#1a2030" stroke="#2a3040" strokeWidth="1.2" />
    <rect x="370" y="303" width="8" height="5" rx="1" fill="#0d1520" stroke="none" />

    {/* Traveling pulse dot */}
    {showPulse && (
      <>
        <circle
          r="5"
          fill="var(--color-accent)"
          opacity="0.95"
          style={{
            offsetPath: `path('M372 306 C358 308 346 312 334 314 C316 318 306 316 306 306 C306 297 314 292 328 292 C342 292 356 294 370 298 C384 302 406 302 442 292 C462 285 478 284 488 286')`,
            offsetDistance: '0%',
            animation: 'wire-pulse 2.4s linear infinite',
          } as React.CSSProperties}
        />
        <circle
          r="10"
          fill="var(--color-accent)"
          opacity="0.18"
          style={{
            offsetPath: `path('M372 306 C358 308 346 312 334 314 C316 318 306 316 306 306 C306 297 314 292 328 292 C342 292 356 294 370 298 C384 302 406 302 442 292 C462 285 478 284 488 286')`,
            offsetDistance: '0%',
            animation: 'wire-pulse 2.4s linear infinite',
          } as React.CSSProperties}
        />
      </>
    )}
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes wire-pulse {
        0%   { offset-distance: 0%;   opacity: 0; }
        5%   { opacity: 0.95; }
        90%  { opacity: 0.95; }
        100% { offset-distance: 100%; opacity: 0; }
      }
    ` }} />
  </g>
);

// ─── ThoughtBubbleCharacter ───────────────────────────────────────────────────

export const ThoughtBubbleCharacter: React.FC<{ symbol?: string; opacity?: number }> = ({
  symbol = '{ }',
  opacity = 0.6,
}) => (
  <g opacity={opacity}>
    {/* Bubble body */}
    <rect
      x="80"
      y="62"
      width="100"
      height="58"
      rx="5"
      fill="rgba(13,17,23,0.85)"
      stroke="var(--color-accent)"
      strokeWidth="1.2"
      strokeDasharray="4 2"
    />
    {/* PCB corner ticks */}
    <path d="M80 73 L73 73" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M91 62 L91 55" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M180 73 L187 73" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M169 62 L169 55" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M80 110 L73 110" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M91 120 L91 127" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M180 110 L187 110" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M169 120 L169 127" fill="none" stroke="var(--color-accent)" strokeWidth="1.0" strokeLinecap="round" />
    {/* Tail */}
    <path
      d="M118 120 C124 130 132 136 140 140 C148 144 158 146 164 143"
      fill="none"
      stroke="var(--color-accent)"
      strokeWidth="1.0"
      strokeLinecap="round"
      strokeDasharray="3 2"
    />
    {/* Symbol */}
    <text
      x="130"
      y="96"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="var(--font-mono)"
      fontSize="15"
      fontWeight="500"
      fill="var(--color-accent)"
      opacity="0.85"
    >
      {symbol.length > 4 ? symbol.slice(0, 4) : symbol}
    </text>
  </g>
);

// ─── ChatIndicator ────────────────────────────────────────────────────────────

export const ChatIndicator: React.FC<{ visible?: boolean; onMobile?: boolean }> = ({
  visible = false,
  onMobile = false,
}) => {
  if (!visible) return null;

  if (onMobile) {
    return (
      <g>
        <rect x="158" y="438" width="92" height="26" rx="13" fill="rgba(13,17,23,0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.0" />
        <text x="204" y="456" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-secondary)">
          tap to talk
        </text>
      </g>
    );
  }

  return (
    <g>
      <rect x="50" y="30" width="108" height="36" rx="9" fill="rgba(13,17,23,0.9)" stroke="rgba(0,212,255,0.45)" strokeWidth="1.2" />
      <path d="M118 66 L114 76 L124 70" fill="rgba(13,17,23,0.9)" stroke="rgba(0,212,255,0.45)" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="82" cy="48" r="3.5" fill="var(--color-text-secondary)" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="1.5s" begin="0s" repeatCount="indefinite" />
      </circle>
      <circle cx="94" cy="48" r="3.5" fill="var(--color-text-secondary)" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="1.5s" begin="0.2s" repeatCount="indefinite" />
      </circle>
      <circle cx="106" cy="48" r="3.5" fill="var(--color-text-secondary)" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.15;0.7" dur="1.5s" begin="0.4s" repeatCount="indefinite" />
      </circle>
      <text x="104" y="82" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--color-text-tertiary)">
        // click me
      </text>
    </g>
  );
};