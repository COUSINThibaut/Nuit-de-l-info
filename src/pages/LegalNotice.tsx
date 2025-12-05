import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Copyright, Server, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LegalNotice() {
    // --- À COMPLÉTER PAR VOS SOINS ---
    const EDITOR_NAME = "GOON SQUAD (Projet Nuit de l'Info 2025)";
    const EDITOR_EMAIL = "ndi.goonsquad@example.com";
    const HOST_NAME = "OVH";
    const HOST_ADDRESS = "2, rue Kellermann, 59100 Roubaix";
    // ----------------------------------

    return (
        <div className="min-h-screen bg-slate-950 text-slate-300 p-8 md:p-16 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <Link to="/" className="text-emerald-400 hover:text-emerald-300 flex items-center gap-2 mb-8">
                    <ArrowLeft size={18} /> Retour à l'accueil
                </Link>

                <h1 className="text-4xl font-black text-white mb-6 border-b border-emerald-500/50 pb-2">
                    Mentions Légales
                </h1>

                <p className="mb-8 text-sm italic text-slate-400">
                    Document rédigé conformément aux exigences légales en vigueur (Loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique).
                </p>

                {/* SECTION 1: IDENTIFICATION DE L'ÉDITEUR */}
                <section className="mb-10 bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
                        <User size={20} /> 1. Éditeur du Site
                    </h2>
                    <dl className="space-y-3 text-sm">
                        <div>
                            <dt className="font-semibold text-white">Nom de l'Entité :</dt>
                            <dd className="ml-4">{EDITOR_NAME}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-white">Statut :</dt>
                            <dd className="ml-4">Projet réalisé dans le cadre de la Nuit de l'Info 2025.</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-white">Contact :</dt>
                            <dd className="ml-4">E-mail : {EDITOR_EMAIL}</dd>
                        </div>
                    </dl>
                </section>

                {/* SECTION 2: HÉBERGEUR */}
                <section className="mb-10 bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
                        <Server size={20} /> 2. Hébergeur du Site
                    </h2>
                    <dl className="space-y-3 text-sm">
                        <div>
                            <dt className="font-semibold text-white">Nom :</dt>
                            <dd className="ml-4">{HOST_NAME}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-white">Adresse :</dt>
                            <dd className="ml-4">{HOST_ADDRESS}</dd>
                        </div>
                        <div>
                            <dt className="font-semibold text-white">Site Web :</dt>
                            <dd className="ml-4"><a href="https://www.ovhcloud.com/fr/" className="underline hover:text-emerald-400">https://www.ovhcloud.com/fr/</a></dd>
                        </div>
                    </dl>
                </section>

                {/* SECTION 3: PROPRIÉTÉ INTELLECTUELLE */}
                <section className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                    <h2 className="text-2xl font-bold text-emerald-400 mb-4 flex items-center gap-3">
                        <Copyright size={20} /> 3. Propriété Intellectuelle
                    </h2>
                    <p className="text-sm">
                        Sauf mention contraire, l'intégralité des éléments de ce site (textes, images, code source) sont la propriété de l'équipe {EDITOR_NAME}.
                    </p>
                    <p className="mt-2 text-sm italic">
                        Le code source du projet est généralement publié sous licence libre (Licence MIT) pour le hackathon, permettant la réutilisation et la modification par des tiers.
                    </p>
                </section>
            </motion.div>
        </div>
    );
}