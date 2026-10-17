export function aboutPage({intro,section,cards,link}) {
 const approved={status:'Approved',decision:'User-supplied About narrative; see ABOUT_PAGE_REVIEW.md. Selected photo publication approved by MCC, October 17, 2026.'};
 return '<div class="about-page">'+
 intro('ABOUT MCC','Our Story. Our Community.','A Markham-based nonprofit bringing people together since 2024.')+
 section('P2.1','Built on Experience. Inspired by Community. Focused on the Next Generation.',`<div class="about-story">
 <p>Markham Community Connect (MCC) was established in 2024, inspired by over 30 years of combined community service, volunteer involvement and experience supporting other community organizations.</p>
 <p>After years of contributing to different community initiatives, the founding team came together with a shared vision: to bring their experience, ideas and passion under one umbrella and create something meaningful and lasting for future generations.</p>
 <p>At the heart of MCC is a simple belief: <strong>children and youth deserve opportunities to discover their potential, build confidence, develop leadership skills and find their feet in an ever-changing world.</strong></p>
 <p>MCC was created to provide a foundation where young people can learn beyond the classroom, stay active, build friendships and develop a sense of responsibility toward their community.</p>
 <p>But building a strong community means connecting every generation. That's why MCC also brings seniors, parents, families and volunteers together through activities that encourage learning, participation and meaningful relationships.</p>
 <p>Today, MCC continues to grow through sports, youth development, seniors programs, cultural celebrations, community events and volunteering.</p>
 <p class="about-belief"><strong>Our belief is simple: When generations connect, communities grow stronger.</strong></p></div>`,approved)+
 section('P2.2','Mission and Vision',cards([
 ['Our Mission','To bring people together through inclusive programs, shared experiences and community initiatives that strengthen connection, belonging and participation in Markham.'],
 ['Our Vision','A welcoming and connected community where children, youth, families and seniors have opportunities to engage, contribute and thrive.']]),approved)+
 section('P2.3','Creating Opportunities. Building Connections.',cards([
 ['Youth & Sports','Soccer, volleyball, badminton and camps.','programs.html'],
 ['Seniors & Wellness','Gardening, healthy aging and social connection.','seniors-in-bloom.html'],
 ['Skills & Discovery','Creativity, entrepreneurship and STEM.','nextgen.html'],
 ['Community Celebrations','Cultural celebrations and shared experiences.','events.html']]),approved)+
 section('P2.4','What Makes MCC Different?',cards([
 ['Youth Development','Creating opportunities for young people to develop confidence, skills, leadership and friendships.'],
 ['Connecting Generations','Bringing children, youth, families and seniors together through shared experiences.'],
 ['Volunteer-Led Community','Encouraging community members to contribute their time, ideas and skills to meaningful activities.'],
 ['Inclusive Participation','Building welcoming opportunities for individuals and families from different backgrounds and generations.']]),approved)+
 section('P2.5','Powered by People. Driven by Community.',`<p>MCC's activities are made possible through the dedication of volunteers and community members who contribute their time, knowledge and energy.</p>
 <p>From organizing soccer sessions and supporting seniors activities to mentoring younger participants and helping deliver community events, volunteers play an important role in bringing MCC's vision to life.</p>
 <p>We believe volunteering is more than giving time. It is an opportunity to develop leadership, build friendships and make a meaningful difference.</p>${link('Volunteer With MCC','get-involved.html#P8-1')}`,approved)+
 section('P2.6','Stronger Through Partnership.',cards([
 ['City of Markham','Through its partnership with the City of Markham at Aaniin Community Centre, MCC brings seniors together for social activities, wellness programs, learning opportunities and community workshops.'],
 ['Islamic Society of Markham (ISM)','ISM is a community partner and program collaborator. MCC helped initiate the Scouts program; ISM currently manages it.'],
 ['Community Champions','Khalid Usman is MCC’s first individual donor and early supporter.']]),approved)+
 section('P2.7','Your Community. Your Opportunity to Make a Difference.',`<div class="actions">${link('Get Involved','get-involved.html')}${link('Explore Programs','programs.html')}</div>`,approved)+'</div>';
}
