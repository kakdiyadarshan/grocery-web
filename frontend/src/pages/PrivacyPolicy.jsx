import React from 'react';
import Subscribe from './Subscribe';

const privacyData = [

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

function PrivacyPolicy() {
    return (
        <div className="w-full max-w-[1440px]  space-y-8  mx-auto p-4 sm:p-6 lg:p-8 mt-10 mb-20">
            <div className="space-y-8">
                {privacyData.map((faq, index) => (
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

            <Subscribe />

        </div>
    );
}

export default PrivacyPolicy;