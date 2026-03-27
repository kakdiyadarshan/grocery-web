import React from 'react';
import Subscribe from './Subscribe';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Newsletter from '../component/Newsletter';

const shippingData = [

    {
        question: "The standard Lorem Ipsum passage",
        answer: [
            {
                type: "paragraph",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi accumsan turpis posuere cursus ultricies. Ut nunc justo, faucibus eget elit quis, vehicula rhoncus nulla. Phasellus convallis sem nec facilisis commodo. Fusce ut molestie turpis. Suspendisse aliquet sed massa in vulputate. Quisque gravida suscipit tincidunt."
            }
        ]
    },
    {
        question: "At vero eos et accusamus et iusto odio dignissimos",
        answer: [
            {
                type: "paragraph",
                content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi accumsan turpis posuere cursus ultricies. Ut nunc justo, faucibus eget elit quis, vehicula rhoncus nulla. Phasellus convallis sem nec facilisis commodo. Fusce ut molestie turpis. Suspendisse aliquet sed massa in vulputate. Quisque gravida suscipit tincidunt."
            }
        ]
    },
    {
        question: "Certain circumstances and owing to the claims of duty or the obligations",
        answer: [
            {
                type: "paragraph",
                content: "But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes."
            }
        ]
    },
    {
        question: "Integer ultrices laoreet nunc in gravida",
        answer: [
            {
                type: "paragraph",
                content: "Sed lobortis pulvinar viverra. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Mauris suscipit dolor scelerisque, bibendum tellus ac, pharetra sapien. Praesent lacinia scelerisque odio et consequat. In a facilisis lacus. Maecenas vel lobortis tellus."
            }
        ]
    }

];

function ShippingPolicy() {
    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-8">
            <div className="bg-[#f8f9fa] border-b border-gray-100 py-10 md:py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-[1440px] mx-auto px-2 md:px-0 lg:px-4">
                    <h1 className="text-3xl md:text-[40px] font-bold text-[#1a1a1a] mb-3 tracking-tight">Shipping Policy</h1>
                    <div className="flex items-center gap-2 text-[13px] md:text-sm text-gray-400 font-medium">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span className="text-gray-300 font-light">&gt;</span>
                        <span className="text-gray-600">Shipping Policy</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto py-12 px-4">
                <div className="space-y-8">
                    {shippingData.map((faq, index) => (
                        <div key={index} className="space-y-4">
                            <h2 className="text-xl md:text-2xl font-semibold text-[var(--text-primary)]">
                                {faq.question}
                            </h2>
                            {faq.answer.map((block, i) => {
                                if (block.type === 'paragraph') {
                                    return (
                                        <p key={i} className="text-sm md:text-base text-[var(--text-secondary)] mt-4 !leading-[1.8rem]">
                                            {block.content}
                                        </p>
                                    );
                                }
                                if (block.type === 'list') {
                                    return (
                                        <ul key={i} className="list-disc pl-5 md:pl-8 space-y-2 mt-4 text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                                            {block.items.map((item, j) => (
                                                <li key={j}>{item}</li>
                                            ))}
                                        </ul>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    ))}
                </div>

                {/* <Subscribe /> */}

                {/* Newsletter */}
                <Newsletter className="w-full pt-6 mt-8" />
            </main>

        </div>
    );
}

export default ShippingPolicy;